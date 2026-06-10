const VehicleModel = require('../models/vehicleModel');

class VehicleController {
  static async listarMeusVeiculos(req, res) {
    try {
      const { id: ownerId } = req.usuarioLogado;
      const veiculos = await VehicleModel.buscarPorDono(ownerId);
      
      return res.status(200).json(veiculos);
    } catch (err) {
      console.error('Erro ao listar veículos:', err);
      return res.status(500).json({ erro: 'Erro interno ao listar veículos' });
    }
  }

  static async adicionarVeiculo(req, res) {
    try {
      const { id: ownerId } = req.usuarioLogado;
      const { make, model, year, plate, color, vin } = req.body;

      if (!make || !model || !year || !plate || !color) {
        return res.status(400).json({ erro: 'Os campos marca, modelo, ano, placa e cor são obrigatórios' });
      }

      const veiculo = await VehicleModel.adicionar(ownerId, make, model, year, plate, color, vin);
      
      return res.status(201).json(veiculo);
    } catch (err) {
      console.error('Erro ao adicionar veículo:', err);
      if (err.code === '23505') { // unique_violation
         return res.status(400).json({ erro: 'Placa ou Chassi já cadastrados' });
      }
      return res.status(500).json({ erro: 'Erro interno ao adicionar veículo' });
    }
  }
}

module.exports = VehicleController;
