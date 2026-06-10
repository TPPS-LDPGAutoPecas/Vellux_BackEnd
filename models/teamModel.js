const db = require('../config/db');

class TeamModel {
  static async listarEquipe() {
    const query = `
      SELECT 
        u.id, 
        u.display_name as name, 
        u.role, 
        u.specialty, 
        u.team_status as status,
        u.email,
        u.phone_number as phone,
        u.photo_url as photo,
        (
          SELECT count(*) 
          FROM service_mechanics sm 
          JOIN services s ON s.id = sm.service_id 
          WHERE sm.mechanic_id = u.id AND s.status IN ('in_progress', 'awaiting_parts')
        )::int as "activeServices",
        (
          SELECT count(*) 
          FROM service_mechanics sm 
          JOIN services s ON s.id = sm.service_id 
          WHERE sm.mechanic_id = u.id AND s.status = 'completed'
        )::int as "completedServices",
        COALESCE((
          SELECT AVG(s.evaluation_rating) 
          FROM service_mechanics sm 
          JOIN services s ON s.id = sm.service_id 
          WHERE sm.mechanic_id = u.id AND s.evaluation_rating IS NOT NULL
        ), 5.0)::numeric(2,1) as rating
      FROM users u
      WHERE u.role IN ('mechanic', 'admin')
      ORDER BY u.display_name ASC;
    `;
    const result = await db.query(query);
    return result.rows;
  }

  static async adicionarMembro(name, email, passwordHash, role, specialty, phone) {
    const query = `
      INSERT INTO users (display_name, email, password_hash, role, specialty, phone_number, team_status)
      VALUES ($1, $2, $3, $4::user_role, $5, $6, 'available')
      RETURNING id, display_name as name, role, specialty, team_status as status, email, phone_number as phone;
    `;
    const result = await db.query(query, [name, email, passwordHash, role, specialty, phone]);
    return result.rows[0];
  }

  static async atualizarMembro(id, name, role, specialty, phone, status) {
    const query = `
      UPDATE users
      SET display_name = $1, role = $2::user_role, specialty = $3, phone_number = $4, team_status = $5
      WHERE id = $6
      RETURNING id, display_name as name, role, specialty, team_status as status, email, phone_number as phone;
    `;
    const result = await db.query(query, [name, role, specialty, phone, status, id]);
    return result.rows[0];
  }

  static async removerMembro(id) {
    const query = `DELETE FROM users WHERE id = $1 RETURNING id`;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = TeamModel;
