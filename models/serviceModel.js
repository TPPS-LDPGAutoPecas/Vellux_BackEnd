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
}

module.exports = ServiceModel;
