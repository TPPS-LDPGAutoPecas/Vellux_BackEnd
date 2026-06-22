const db = require('../config/db');

class FinanceModel {
  static async getDashboardMetrics(range, startDate, endDate) {
    let dateFilter = '';
    
    let prevDateFilter = '';

    if (range === 'custom' && startDate && endDate) {
      // Validate dates to prevent SQL Injection
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(startDate) && dateRegex.test(endDate)) {
        dateFilter = `AND finished_at >= '${startDate} 00:00:00' AND finished_at <= '${endDate} 23:59:59'`;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diff = end.getTime() - start.getTime();
        const prevEnd = new Date(start.getTime() - 1000);
        const prevStart = new Date(prevEnd.getTime() - diff);
        const pS = prevStart.toISOString().split('T')[0];
        const pE = prevEnd.toISOString().split('T')[0];
        prevDateFilter = `AND finished_at >= '${pS} 00:00:00' AND finished_at <= '${pE} 23:59:59'`;
      } else {
        dateFilter = `AND finished_at >= date_trunc('month', CURRENT_DATE)`;
        prevDateFilter = `AND finished_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') AND finished_at < date_trunc('month', CURRENT_DATE)`;
      }
    } else if (range === 'week') {
      dateFilter = `AND finished_at >= date_trunc('week', CURRENT_DATE)`;
      prevDateFilter = `AND finished_at >= date_trunc('week', CURRENT_DATE - INTERVAL '1 week') AND finished_at < date_trunc('week', CURRENT_DATE)`;
    } else if (range === 'month') {
      dateFilter = `AND finished_at >= date_trunc('month', CURRENT_DATE)`;
      prevDateFilter = `AND finished_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') AND finished_at < date_trunc('month', CURRENT_DATE)`;
    } else if (range === 'quarter') {
      dateFilter = `AND finished_at >= date_trunc('quarter', CURRENT_DATE)`;
      prevDateFilter = `AND finished_at >= date_trunc('quarter', CURRENT_DATE - INTERVAL '3 months') AND finished_at < date_trunc('quarter', CURRENT_DATE)`;
    } else if (range === 'year') {
      dateFilter = `AND finished_at >= date_trunc('year', CURRENT_DATE)`;
      prevDateFilter = `AND finished_at >= date_trunc('year', CURRENT_DATE - INTERVAL '1 year') AND finished_at < date_trunc('year', CURRENT_DATE)`;
    } else {
      // Default to month if range is invalid/missing
      dateFilter = `AND finished_at >= date_trunc('month', CURRENT_DATE)`;
      prevDateFilter = `AND finished_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') AND finished_at < date_trunc('month', CURRENT_DATE)`;
    }

    try {
      // 1. KPIs
      const kpisQuery = `
        SELECT 
          COALESCE(SUM(budget), 0) AS total_revenue,
          COUNT(id) AS total_services,
          COALESCE(AVG(budget), 0) AS average_ticket,
          COALESCE(AVG(evaluation_rating), 0) AS average_satisfaction,
          COALESCE(AVG(EXTRACT(EPOCH FROM (finished_at - start_date))/86400), 0) AS average_repair_time
        FROM services 
        WHERE status = 'completed' ${dateFilter}
      `;
      const kpisResult = await db.query(kpisQuery);
      
      const kpi = {
        totalRevenue: parseFloat(kpisResult.rows[0].total_revenue) || 0,
        totalServices: parseInt(kpisResult.rows[0].total_services) || 0,
        averageTicket: parseFloat(kpisResult.rows[0].average_ticket) || 0,
        averageSatisfaction: parseFloat(kpisResult.rows[0].average_satisfaction) || 0,
        averageRepairTime: parseFloat(kpisResult.rows[0].average_repair_time) || 0,
      };

      const prevKpisQuery = `
        SELECT 
          COALESCE(SUM(budget), 0) AS total_revenue,
          COUNT(id) AS total_services,
          COALESCE(AVG(budget), 0) AS average_ticket
        FROM services 
        WHERE status = 'completed' ${prevDateFilter}
      `;
      const prevKpisResult = await db.query(prevKpisQuery);

      const calcTrend = (current, previous) => {
        if (previous === 0) return current > 0 ? '+100%' : '0%';
        const diff = ((current - previous) / previous) * 100;
        const sign = diff >= 0 ? '+' : '';
        return `${sign}${diff.toFixed(1)}%`;
      };

      const trends = {
        totalRevenue: calcTrend(kpi.totalRevenue, parseFloat(prevKpisResult.rows[0].total_revenue)),
        totalServices: calcTrend(kpi.totalServices, parseInt(prevKpisResult.rows[0].total_services)),
        averageTicket: calcTrend(kpi.averageTicket, parseFloat(prevKpisResult.rows[0].average_ticket)),
      };

      // 2. Revenue Chart (grouped by month or day based on range)
      // If year, group by month. If month/week, group by day.
      let groupByFormat = "to_char(finished_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 'DD/MM')";
      if (range === 'year') {
        groupByFormat = "to_char(finished_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 'MM/YYYY')";
      } else if (range === 'custom' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if ((end - start) / (1000 * 60 * 60 * 24) > 60) {
          groupByFormat = "to_char(finished_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 'MM/YYYY')";
        }
      }
      
      const revenueQuery = `
        SELECT 
          ${groupByFormat} as name,
          SUM(budget) as value
        FROM services
        WHERE status = 'completed' ${dateFilter}
        GROUP BY name
        ORDER BY MIN(finished_at) ASC
      `;
      const revenueResult = await db.query(revenueQuery);
      const revenueData = revenueResult.rows.map(row => ({
        name: row.name,
        value: parseFloat(row.value) || 0
      }));

      // 3. Service Mix (Pie/Donut chart)
      // Since title might be free text, we will do a basic aggregation and limit to top 5
      const mixQuery = `
        SELECT 
          title as name, 
          COUNT(id) as count,
          SUM(budget) as value
        FROM services
        WHERE status = 'completed' ${dateFilter}
        GROUP BY title
        ORDER BY value DESC
        LIMIT 5
      `;
      const mixResult = await db.query(mixQuery);
      const serviceMixData = mixResult.rows.map(row => ({
        name: row.name,
        count: parseInt(row.count),
        value: parseFloat(row.value)
      }));

      // 4. Specialist Performance
      const techQuery = `
        SELECT 
          u.display_name as name,
          COUNT(sm.service_id) as services,
          SUM(s.budget) as revenue
        FROM users u
        JOIN service_mechanics sm ON u.id = sm.mechanic_id
        JOIN services s ON s.id = sm.service_id
        WHERE s.status = 'completed' ${dateFilter}
        GROUP BY u.id
        ORDER BY revenue DESC
        LIMIT 5
      `;
      const techResult = await db.query(techQuery);
      const techPerformanceData = techResult.rows.map(row => ({
        name: row.name,
        services: parseInt(row.services),
        revenue: parseFloat(row.revenue) || 0
      }));

      // 5. Recent Transactions
      const transactionsQuery = `
        SELECT 
          s.id,
          s.title,
          u.display_name as client_name,
          s.finished_at,
          s.budget as value
        FROM services s
        JOIN users u ON s.client_id = u.id
        WHERE s.status = 'completed'
        ORDER BY s.finished_at DESC
        LIMIT 5
      `;
      const transactionsResult = await db.query(transactionsQuery);
      const recentTransactions = transactionsResult.rows.map(row => ({
        id: row.id,
        title: row.title,
        clientName: row.client_name,
        finishedAt: row.finished_at,
        value: parseFloat(row.value) || 0
      }));

      // 6. Time per Service Type
      const timeQuery = `
        SELECT 
          title as name, 
          COALESCE(AVG(EXTRACT(EPOCH FROM (finished_at - start_date))/86400), 0) as avg_days
        FROM services
        WHERE status = 'completed' ${dateFilter} AND start_date IS NOT NULL AND finished_at IS NOT NULL
        GROUP BY title
        ORDER BY avg_days DESC
        LIMIT 5
      `;
      const timeResult = await db.query(timeQuery);
      const timePerServiceData = timeResult.rows.map(row => ({
        name: row.name,
        avgDays: parseFloat(row.avg_days) || 0
      }));

      return {
        kpis: kpi,
        trends,
        revenueData,
        serviceMixData,
        techPerformanceData,
        recentTransactions,
        timePerServiceData
      };
    } catch (error) {
      console.error('Erro no modelo Financeiro:', error);
      throw error;
    }
  }
}

module.exports = FinanceModel;
