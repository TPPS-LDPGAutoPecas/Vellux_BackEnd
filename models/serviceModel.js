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
          ELSE NULL END as evaluation
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
        TO_CHAR(s.start_date, 'HH24:MI') as "startTime",
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

  static async iniciarServico(serviceId, mechanicId) {
    // 1. Atualizar status e data
    const queryUpdate = `
      UPDATE services 
      SET status = 'in_progress', start_date = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const resUpdate = await db.query(queryUpdate, [serviceId]);
    
    // 2. Criar log
    const queryLog = `
      INSERT INTO service_logs (service_id, mechanic_id, status, description)
      VALUES ($1, $2, 'in_progress', 'Execução Técnica Iniciada')
    `;
    await db.query(queryLog, [serviceId, mechanicId]);

    return resUpdate.rows[0];
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
}

module.exports = ServiceModel;
