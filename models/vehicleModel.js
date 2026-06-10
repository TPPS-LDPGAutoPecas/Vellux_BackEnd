const db = require('../config/db');

class VehicleModel {
  static async buscarPorDono(ownerId) {
    const query = `
      SELECT id, owner_id as "ownerId", make, model, year, plate, color, vin, last_maintenance as "lastMaintenance"
      FROM vehicles
      WHERE owner_id = $1
      ORDER BY id DESC;
    `;
    const result = await db.query(query, [ownerId]);
    return result.rows;
  }

  static async adicionar(ownerId, make, model, year, plate, color, vin) {
    const query = `
      INSERT INTO vehicles (owner_id, make, model, year, plate, color, vin)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, owner_id as "ownerId", make, model, year, plate, color, vin;
    `;
    const values = [ownerId, make, model, year, plate, color, vin || null];
    
    const result = await db.query(query, values);
    return result.rows[0];
  }
}

module.exports = VehicleModel;
