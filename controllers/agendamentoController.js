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

      const agendamento = await AgendamentoModel.criarAgendamento(
        client_id,
        vehicle_id,
        dataHoraInicio.toISOString(),
        service_type,
        notes, 
        null // Não tem Google Calendar ID ainda
      );

      return res.status(201).json({
        mensagem: 'Solicitação de agendamento enviada com sucesso!',
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

  static async listarPendentesAdmin(req, res) {
    try {
      const pendentes = await AgendamentoModel.listarPendentesAdmin();
      return res.status(200).json(pendentes);
    } catch (error) {
      console.error('[ERRO LISTAR PENDENTES ADMIN]', error);
      return res.status(500).json({ erro: 'Erro interno ao listar agendamentos pendentes.' });
    }
  }

  static async listarSolicitacoesAdmin(req, res) {
    try {
      const solicitacoes = await AgendamentoModel.listarSolicitacoes();
      return res.status(200).json(solicitacoes);
    } catch (error) {
      console.error('[ERRO LISTAR SOLICITACOES]', error);
      return res.status(500).json({ erro: 'Erro interno ao listar solicitações.' });
    }
  }

  static async buscarHorariosDisponiveis(req, res) {
    try {
      const { date } = req.query; // YYYY-MM-DD
      
      if (!date) {
        return res.status(400).json({ erro: 'Data não informada.' });
      }

      const appointments = await AgendamentoModel.buscarPorData(date);
      
      const GRADE_HORARIOS = ['08:00', '10:00', '13:30', '15:00', '17:30'];
      
      // Get booked times (in 'HH:MM' format)
      const bookedTimes = appointments.map(app => {
        const d = new Date(app.scheduled_date);
        return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
      });

      // Filter available times
      let availableSlots = GRADE_HORARIOS.filter(slot => !bookedTimes.includes(slot));

      // Se a data solicitada for hoje, bloquear os horários que já passaram
      const today = new Date();
      const reqDate = new Date(date + 'T00:00:00-03:00'); // Considerar fuso local ou o mesmo do timezone do app
      
      if (
        reqDate.getFullYear() === today.getFullYear() &&
        reqDate.getMonth() === today.getMonth() &&
        reqDate.getDate() === today.getDate()
      ) {
        const nowHour = today.getHours();
        const nowMinute = today.getMinutes();
        
        availableSlots = availableSlots.filter(slot => {
          const [h, m] = slot.split(':').map(Number);
          if (h > nowHour) return true;
          if (h === nowHour && m > nowMinute) return true;
          return false;
        });
      }

      return res.status(200).json({ slots: availableSlots });
    } catch (error) {
      console.error('[ERRO BUSCAR HORARIOS]', error);
      return res.status(500).json({ erro: 'Erro interno ao buscar horários.' });
    }
  }
  static async aprovarServico(req, res) {
    try {
      const { id } = req.params;
      const agendamento = await AgendamentoModel.buscarPorId(id);

      if (!agendamento) {
        return res.status(404).json({ erro: 'Agendamento não encontrado.' });
      }

      if (agendamento.status !== 'requested') {
        return res.status(400).json({ erro: 'Apenas agendamentos solicitados podem ser aprovados.' });
      }

      const detalhes = await AgendamentoModel.obterDetalhes(agendamento.client_id, agendamento.vehicle_id);

      const dataHoraInicio = new Date(agendamento.scheduled_date);
      const dataHoraFim = new Date(dataHoraInicio.getTime() + 2 * 60 * 60 * 1000);

      const resumoGoogle = `Vellux Motors - ${agendamento.service_type}`;
      
      let descricaoGoogle = `🔧 Serviço: ${agendamento.service_type}\n`;
      descricaoGoogle += `👤 Cliente: ${detalhes.display_name}\n`;
      descricaoGoogle += `🚗 Veículo: ${detalhes.make} ${detalhes.model} (Placa: ${detalhes.plate})\n`;
      
      if (agendamento.notes) {
          descricaoGoogle += `\n📝 Observações do Cliente: ${agendamento.notes}`;
      }

      const googleCalendarId = await GoogleCalendarService.criarAgendamento(
        resumoGoogle,
        descricaoGoogle,
        dataHoraInicio.toISOString(),
        dataHoraFim.toISOString()
      );

      const atualizado = await AgendamentoModel.atualizarStatus(id, 'confirmed', null, googleCalendarId);

      return res.status(200).json({ mensagem: 'Agendamento aprovado com sucesso.', agendamento: atualizado });
    } catch (error) {
      console.error('[ERRO APROVAR SERVICO]', error);
      return res.status(500).json({ erro: 'Erro interno ao aprovar agendamento.' });
    }
  }

  static async rejeitarServico(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ erro: 'Motivo da recusa é obrigatório.' });
      }

      const agendamento = await AgendamentoModel.buscarPorId(id);

      if (!agendamento) {
        return res.status(404).json({ erro: 'Agendamento não encontrado.' });
      }

      const atualizado = await AgendamentoModel.atualizarStatus(id, 'rejected', reason, null);

      return res.status(200).json({ mensagem: 'Agendamento rejeitado.', agendamento: atualizado });
    } catch (error) {
      console.error('[ERRO REJEITAR SERVICO]', error);
      return res.status(500).json({ erro: 'Erro interno ao rejeitar agendamento.' });
    }
  }

  static async listarPorCliente(req, res) {
    try {
      const client_id = req.usuarioLogado.id;
      const agendamentos = await AgendamentoModel.listarPorCliente(client_id);
      return res.status(200).json(agendamentos);
    } catch (error) {
      console.error('[ERRO LISTAR POR CLIENTE]', error);
      return res.status(500).json({ erro: 'Erro interno ao listar agendamentos do cliente.' });
    }
  }
}

module.exports = AgendamentoController;