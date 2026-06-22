const db = require('../config/db');

class OverviewModel {
  static async getOverviewData() {
    try {
      // 1. Faturamento Mensal (apenas completed neste mes)
      const revenueQuery = `
        SELECT COALESCE(SUM(budget), 0) AS "faturamentoMensal"
        FROM services
        WHERE status = 'completed' AND finished_at >= date_trunc('month', CURRENT_DATE);
      `;
      const revenueResult = await db.query(revenueQuery);
      const faturamentoMensal = Number(revenueResult.rows[0].faturamentoMensal);

      // 2. Serviços Ativos (pending, in_progress, awaiting_parts)
      const activeCountQuery = `
        SELECT COUNT(*) AS "servicosAtivos"
        FROM services
        WHERE status IN ('pending', 'in_progress', 'awaiting_parts');
      `;
      const activeCountResult = await db.query(activeCountQuery);
      const servicosAtivos = Number(activeCountResult.rows[0].servicosAtivos);

      // 3. Novos Clientes no mês
      const newClientsQuery = `
        SELECT COUNT(*) AS "novosClientes"
        FROM users
        WHERE role = 'client' AND created_at >= date_trunc('month', CURRENT_DATE);
      `;
      const newClientsResult = await db.query(newClientsQuery);
      const novosClientes = Number(newClientsResult.rows[0].novosClientes);

      // 4. Taxa de Fidelidade
      const fidelityQuery = `
        WITH ClientStats AS (
          SELECT client_id, COUNT(*) AS service_count
          FROM services
          GROUP BY client_id
        )
        SELECT 
          (SELECT COUNT(*) FROM ClientStats WHERE service_count > 1) AS "loyal_clients",
          (SELECT COUNT(*) FROM users WHERE role = 'client') AS "total_clients"
      `;
      const fidelityResult = await db.query(fidelityQuery);
      const loyalClients = Number(fidelityResult.rows[0].loyal_clients);
      const totalClients = Number(fidelityResult.rows[0].total_clients);
      const taxaFidelidade = totalClients > 0 ? ((loyalClients / totalClients) * 100).toFixed(1) + '%' : '0%';

      // 5. Lista de Serviços Ativos em tempo real (limit 10 para o dashboard)
      const activeServicesQuery = `
        SELECT 
          s.id,
          s.status,
          s.title as "type",
          v.make || ' ' || v.model as "car",
          v.plate,
          c.display_name as "client",
          (
            SELECT m.display_name 
            FROM service_mechanics sm 
            JOIN users m ON sm.mechanic_id = m.id 
            WHERE sm.service_id = s.id 
            LIMIT 1
          ) as "tech"
        FROM services s
        JOIN vehicles v ON s.vehicle_id = v.id
        JOIN users c ON s.client_id = c.id
        WHERE s.status IN ('pending', 'in_progress', 'awaiting_parts')
        ORDER BY s.scheduled_date ASC
        LIMIT 10;
      `;
      const activeServicesResult = await db.query(activeServicesQuery);
      
      // Total count of active services para mostrar "+ X outros"
      const activeServicesCount = servicosAtivos;

      // 6. Agenda de Hoje
      const todayScheduleQuery = `
        SELECT 
          to_char(a.scheduled_date, 'HH24:MI') as "time",
          v.make || ' ' || v.model as "car",
          a.status
        FROM appointments a
        JOIN vehicles v ON a.vehicle_id = v.id
        WHERE date_trunc('day', a.scheduled_date) = date_trunc('day', CURRENT_DATE)
        ORDER BY a.scheduled_date ASC
        LIMIT 5;
      `;
      const todayScheduleResult = await db.query(todayScheduleQuery);

      // Translation dictionary for frontend statuses
      const statusMap = {
        'requested': 'Aguardando',
        'confirmed': 'Confirmado',
        'cancelled': 'Cancelado',
        'completed': 'Concluído'
      };

      const mappedSchedule = todayScheduleResult.rows.map(apt => ({
        time: apt.time,
        car: apt.car,
        status: statusMap[apt.status] || apt.status
      }));

      // Count pendentes hoje
      const pendingTodayQuery = `
        SELECT COUNT(*) as count 
        FROM appointments 
        WHERE date_trunc('day', scheduled_date) = date_trunc('day', CURRENT_DATE) 
        AND status IN ('requested', 'confirmed');
      `;
      const pendingTodayResult = await db.query(pendingTodayQuery);
      const pendingToday = Number(pendingTodayResult.rows[0].count);

      // Count ALL pending requests
      const pendingRequestsQuery = `
        SELECT COUNT(*) as count 
        FROM appointments 
        WHERE status = 'requested';
      `;
      const pendingRequestsResult = await db.query(pendingRequestsQuery);
      const pendingRequests = Number(pendingRequestsResult.rows[0].count);

      return {
        stats: {
          faturamentoMensal,
          servicosAtivos,
          novosClientes,
          taxaFidelidade
        },
        activeServices: activeServicesResult.rows,
        activeServicesTotal: activeServicesCount,
        todaySchedule: mappedSchedule,
        pendingToday,
        pendingRequests
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = OverviewModel;
