require('dotenv').config();
const db = require('./config/db');

async function dropAppointmentsAndServices() {
  try {
    console.log("Iniciando limpeza das tabelas appointments e services...");
    
    // Deleta os logs e reports porque tem ON DELETE CASCADE, mas TRUNCATE é mais rápido
    // Vamos usar DELETE FROM para não resetar sequences caso ele prefira, ou TRUNCATE CASCADE para limpar tudo.
    await db.query(`TRUNCATE TABLE appointments, services CASCADE;`);
    
    console.log("Tabelas appointments e services (e dependentes) limpas com sucesso!");
  } catch (err) {
    console.error("Erro ao limpar tabelas:", err);
  } finally {
    process.exit(0);
  }
}

dropAppointmentsAndServices();
