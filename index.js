const express = require('express');
const cors = require('cors');
const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Backend da Vellux Motors rodando com sucesso!');
});

// Registrando as rotas
app.use('/api', usuarioRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});