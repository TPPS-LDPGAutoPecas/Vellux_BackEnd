const AgendamentoModel = require('../models/agendamentoModel');
const GoogleCalendarService = require('../utils/googleCalendarService');

class AgendamentoController {
  static async agendarServico(req, res) {
    try {
      const { vehicle_id, service_type, date, time, notes } = req.body;
      const client_id = req.usuarioLogado.id; 

      if (!vehicle_id || !service_type || !date || !time) {
        return res.status(400).json({ erro: 'Todos os campos obrigatórios devem ser preenchidos.' });
      }

      const detalhes = await AgendamentoModel.obterDetalhes(client_id, vehicle_id);
      if (!detalhes) {
          return res.status(404).json({ erro: 'Cliente ou veículo não encontrado no sistema.' });
      }

      const dataHoraInicio = new Date(`${date}T${time}:00-03:00`);
      const dataHoraFim = new Date(dataHoraInicio.getTime() + 2 * 60 * 60 * 1000);

      const resumoGoogle = `Vellux Motors - ${service_type}`;
      
      let descricaoGoogle = `🔧 Serviço: ${service_type}\n`;
      descricaoGoogle += `👤 Cliente: ${detalhes.display_name}\n`;
      descricaoGoogle += `🚗 Veículo: ${detalhes.make} ${detalhes.model} (Placa: ${detalhes.plate})\n`;
      
      if (notes) {
          descricaoGoogle += `\n📝 Observações do Cliente: ${notes}`;
      }

      const googleCalendarId = await GoogleCalendarService.criarAgendamento(
        resumoGoogle,
        descricaoGoogle,
        dataHoraInicio.toISOString(),
        dataHoraFim.toISOString()
      );

      const agendamento = await AgendamentoModel.criarAgendamento(
        client_id,
        vehicle_id,
        dataHoraInicio.toISOString(),
        service_type,
        notes, 
        googleCalendarId
      );

      return res.status(201).json({
        mensagem: 'Agendamento confirmado com sucesso!',
        agendamento
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro interno ao processar o agendamento.' });
    }
  }

  static async cancelarServico(req, res) {
    try {
      const { id } = req.params;
      const client_id = req.usuarioLogado.id;
      const role = req.usuarioLogado.role;

      console.log(`\n[DEBUG] Tentando cancelar agendamento ID: ${id} (tipo: ${typeof id}) pelo cliente ID: ${client_id}`);

      const agendamento = await AgendamentoModel.buscarPorId(id);

      if (!agendamento) {
        console.log(`[DEBUG] Falha: Agendamento ${id} não encontrado no banco de dados.`);
        return res.status(404).json({ erro: 'Agendamento não encontrado.' });
      }

      // Segurança: Cast numérico absoluto para evitar a rasteira do BIGINT (String !== Number)
      if (Number(agendamento.client_id) !== Number(client_id) && role !== 'admin') {
        console.log(`[DEBUG] Falha de Acesso. Dono do carro no banco: ${agendamento.client_id}, Requisitante via Token: ${client_id}`);
        return res.status(403).json({ erro: 'Não tem permissão para cancelar este agendamento.' });
      }

      if (agendamento.google_calendar_id) {
        console.log(`[DEBUG] Apagando no Google Agenda o evento: ${agendamento.google_calendar_id}`);
        await GoogleCalendarService.cancelarAgendamento(agendamento.google_calendar_id);
      }

      await AgendamentoModel.deletarAgendamento(id);
      console.log(`[DEBUG] Sucesso! Agendamento ${id} apagado nas duas plataformas.\n`);

      return res.status(200).json({ mensagem: 'Agendamento cancelado com sucesso.' });

    } catch (error) {
      console.error('[ERRO CANCELAR]', error);
      return res.status(500).json({ erro: 'Erro interno ao cancelar o agendamento.' });
    }
  }
}

module.exports = AgendamentoController;