const db = require('../config/db');

class AgendamentoModel {
  static async obterDetalhes(clientId, vehicleId) {
    const query = `
      SELECT u.display_name, v.make, v.model, v.plate
      FROM users u
      JOIN vehicles v ON v.id = $2
      WHERE u.id = $1;
    `;
    const result = await db.query(query, [clientId, vehicleId]);
    return result.rows[0];
  }

  static async criarAgendamento(clientId, vehicleId, scheduledDate, serviceType, notes, googleCalendarId) {
    const query = `
      INSERT INTO appointments (client_id, vehicle_id, scheduled_date, service_type, notes, google_calendar_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [clientId, vehicleId, scheduledDate, serviceType, notes, googleCalendarId];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async buscarPorId(id) {
    const query = 'SELECT * FROM appointments WHERE id = $1';
    // Força a conversão do ID para número para evitar bugs de string
    const result = await db.query(query, [parseInt(id, 10)]);
    return result.rows[0];
  }

  static async deletarAgendamento(id) {
    const query = 'DELETE FROM appointments WHERE id = $1 RETURNING *';
    // Força a conversão do ID para número
    const result = await db.query(query, [parseInt(id, 10)]);
    return result.rows[0];
  }

  static async listarPendentesAdmin() {
    const query = `
      SELECT 
        a.id, 
        u.display_name as client, 
        v.make || ' ' || v.model as car, 
        v.plate, 
        a.scheduled_date as date
      FROM appointments a
      JOIN users u ON a.client_id = u.id
      JOIN vehicles v ON a.vehicle_id = v.id
      WHERE a.id NOT IN (SELECT appointment_id FROM services WHERE appointment_id IS NOT NULL)
      ORDER BY a.scheduled_date ASC;
    `;
    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = AgendamentoModel;