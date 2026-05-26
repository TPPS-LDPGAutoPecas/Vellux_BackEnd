const { google } = require('googleapis');
const path = require('path');

class GoogleCalendarService {
  
  // 1. Método para CRIAR o evento
  static async criarAgendamento(resumo, descricao, dataHoraInicio, dataHoraFim) {
    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: path.join(__dirname, '../config/google-credentials.json'),
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });

      const calendar = google.calendar({ version: 'v3', auth });

      const evento = {
        summary: resumo,
        description: descricao,
        start: { dateTime: dataHoraInicio, timeZone: 'America/Sao_Paulo' },
        end: { dateTime: dataHoraFim, timeZone: 'America/Sao_Paulo' },
      };

      const response = await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        resource: evento,
      });

      return response.data.id; // Retorna o google_calendar_id gerado
    } catch (error) {
      console.error('Erro na API do Google Calendar:', error);
      throw new Error('Falha ao integrar com o Google Calendar.');
    }
  }

  // 2. Método para ELIMINAR o evento
  static async cancelarAgendamento(googleCalendarId) {
    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: path.join(__dirname, '../config/google-credentials.json'),
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });
      
      const calendar = google.calendar({ version: 'v3', auth });

      // Chama a API da Google para eliminar o evento com o ID específico
      await calendar.events.delete({
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        eventId: googleCalendarId,
      });
      
    } catch (error) {
      console.error('Erro ao eliminar no Google:', error);
      throw new Error('Falha ao excluir o evento no Google Calendar.');
    }
  }
  
}

module.exports = GoogleCalendarService;