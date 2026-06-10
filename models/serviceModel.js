const db = require('../config/db');

class ServiceModel {
  static async buscarPorCliente(clientId) {
    const query = `
      SELECT 
          s.id,
          s.vehicle_id as "vehicleId",
          v.make || ' ' || v.model as "vehicleName",
          s.client_id as "clientId",
          s.title,
          s.description,
          s.status,
          s.scheduled_date as "scheduledDate",
          s.start_date as "startDate",
          s.expected_delivery as "expectedDelivery",
          s.finished_at as "endDate",
          s.budget,
          COALESCE((
              SELECT json_agg(u.display_name)
              FROM service_mechanics sm
              JOIN users u ON u.id = sm.mechanic_id
              WHERE sm.service_id = s.id
          ), '[]'::json) as "mechanicIds",
          COALESCE((
              SELECT json_agg(json_build_object(
                  'timestamp', sl.created_at,
                  'status', sl.status,
                  'message', sl.description,
                  'authorId', u.display_name
              ) ORDER BY sl.created_at ASC)
              FROM service_logs sl
              LEFT JOIN users u ON u.id = sl.mechanic_id
              WHERE sl.service_id = s.id
          ), '[]'::json) as history,
          CASE WHEN s.evaluation_rating IS NOT NULL THEN
              json_build_object(
                  'rating', s.evaluation_rating,
                  'comment', s.evaluation_comment
              )
          ELSE NULL END as evaluation,
          (
              SELECT json_build_object(
                  'serviceName', tr.service_name,
                  'procedures', tr.procedures,
                  'diagnostics', tr.diagnostics,
                  'recommendations', tr.recommendations,
                  'observations', tr.observations,
                  'finalValue', tr.final_value,
                  'parts', COALESCE((
                      SELECT json_agg(json_build_object(
                          'name', sp.name,
                          'brand', sp.brand,
                          'quantity', sp.quantity
                      ))
                      FROM spare_parts sp
                      WHERE sp.report_id = tr.service_id
                  ), '[]'::json)
              )
              FROM technical_reports tr
              WHERE tr.service_id = s.id
          ) as report
      FROM services s
      JOIN vehicles v ON v.id = s.vehicle_id
      WHERE s.client_id = $1
      ORDER BY s.created_at DESC;
    `;
    const result = await db.query(query, [clientId]);
    return result.rows;
  }

  static async listarParaAdmin() {
    const query = `
      SELECT 
        s.id,
        u.display_name as client,
        v.make || ' ' || v.model as car,
        v.plate,
        s.title as type,
        s.status,
        TO_CHAR(s.start_date, 'DD/MM/YYYY HH24:MI') as "startTime",
        s.description as diagnostics,
        COALESCE((
            SELECT json_agg(u.display_name)
            FROM service_mechanics sm
            JOIN users u ON u.id = sm.mechanic_id
            WHERE sm.service_id = s.id
        ), '[]'::json) as mechanics
      FROM services s
      JOIN users u ON u.id = s.client_id
      JOIN vehicles v ON v.id = s.vehicle_id
      ORDER BY s.created_at DESC;
    `;
    const result = await db.query(query);
    return result.rows;
  }

  static async fazerCheckin(appointmentId, title, description) {
    const query = `
      INSERT INTO services (vehicle_id, client_id, appointment_id, title, description, scheduled_date, status)
      SELECT vehicle_id, client_id, id, $2, $3, scheduled_date, 'pending'
      FROM appointments
      WHERE id = $1
      RETURNING *;
    `;
    const result = await db.query(query, [appointmentId, title, description]);
    return result.rows[0];
  }

  static async atualizarServico(serviceId, title, description) {
    const query = `
      UPDATE services 
      SET title = COALESCE($2, title),
          description = COALESCE($3, description)
      WHERE id = $1
      RETURNING *;
    `;
    const result = await db.query(query, [serviceId, title, description]);
    if (result.rows.length === 0) throw new Error('Serviço não encontrado');
    return result.rows[0];
  }

  static async iniciarServico(serviceId, mechanicId, expectedDelivery = null) {
    const check = await db.query(`SELECT status FROM services WHERE id = $1`, [serviceId]);
    if (check.rows.length === 0) throw new Error('Serviço não encontrado');
    if (check.rows[0].status !== 'pending') throw new Error('Serviço não está pendente');

    const result = await db.query(
      `UPDATE services SET status = 'in_progress', start_date = CURRENT_TIMESTAMP, expected_delivery = $1 WHERE id = $2 RETURNING *`,
      [expectedDelivery || null, serviceId]
    );

    // Adiciona log
    await db.query(
      `INSERT INTO service_logs (service_id, mechanic_id, status, description) VALUES ($1, $2, 'in_progress', 'Serviço Iniciado')`,
      [serviceId, mechanicId]
    );

    return result.rows[0];
  }

  static async atribuirMecanico(serviceId, mechanicId) {
    // Verifica se já existe
    const checkQuery = `SELECT * FROM service_mechanics WHERE service_id = $1 AND mechanic_id = $2`;
    const checkRes = await db.query(checkQuery, [serviceId, mechanicId]);

    if (checkRes.rows.length > 0) {
      // Se existe, remove (toggle)
      await db.query(`DELETE FROM service_mechanics WHERE service_id = $1 AND mechanic_id = $2`, [serviceId, mechanicId]);
      return { action: 'removed' };
    } else {
      // Se não existe, insere
      await db.query(`INSERT INTO service_mechanics (service_id, mechanic_id) VALUES ($1, $2)`, [serviceId, mechanicId]);
      return { action: 'added' };
    }
  }

  static async finalizarServico(serviceId, mechanicId, reportData) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // 1. Atualizar o serviço
      const queryUpdate = `
        UPDATE services
        SET status = 'completed', finished_at = CURRENT_TIMESTAMP, budget = $1
        WHERE id = $2
        RETURNING *;
      `;
      await client.query(queryUpdate, [reportData.finalValue, serviceId]);

      // 2. Inserir o Laudo
      const queryReport = `
        INSERT INTO technical_reports (service_id, service_name, procedures, diagnostics, observations, final_value)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      await client.query(queryReport, [
        serviceId,
        reportData.serviceName,
        JSON.stringify(reportData.procedures || []),
        reportData.diagnostics,
        reportData.observations,
        reportData.finalValue
      ]);

      // 3. Inserir peças
      if (reportData.parts && reportData.parts.length > 0) {
        for (const part of reportData.parts) {
          if (part.name) {
            const queryPart = `
              INSERT INTO spare_parts (report_id, name, brand, quantity, unit_price)
              VALUES ($1, $2, $3, $4, 0.00)
            `;
            await client.query(queryPart, [
              serviceId,
              part.name,
              part.brand,
              parseInt(part.qty) || 1
            ]);
          }
        }
      }

      // 4. Inserir Log
      const queryLog = `
        INSERT INTO service_logs (service_id, mechanic_id, status, description)
        VALUES ($1, $2, 'completed', 'Serviço Finalizado. Laudo Emitido.')
      `;
      await client.query(queryLog, [serviceId, mechanicId]);

      await client.query('COMMIT');
      return { sucesso: true };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = ServiceModel;
