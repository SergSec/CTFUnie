const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getOrCreateWallet, addTransaction } = require('../utils/wallet');

const router = express.Router();

// @route   GET /api/wallet
// @desc    Obtener wallet del usuario autenticado
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const wallet = await getOrCreateWallet(req.user._id);
    res.json({ success: true, wallet });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener wallet', error: error.message });
  }
});

// @route   GET /api/wallet/user/:id
// @desc    Obtener wallet de un usuario (admin)
// @access  Private/Admin
router.get('/user/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const wallet = await getOrCreateWallet(req.params.id);
    res.json({ success: true, wallet });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener wallet', error: error.message });
  }
});

// @route   POST /api/wallet/topup
// @desc    Recargar moneda virtual
// @access  Private/Admin
router.post('/topup', protect, authorize('admin'), async (req, res) => {
  try {
    const { userId, amount, description } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Usuario y monto válido son requeridos' });
    }

    const wallet = await getOrCreateWallet(userId);
    wallet.balance += amount;
    await addTransaction(wallet, {
      type: 'topup',
      amount,
      description: description || 'Recarga manual',
    });

    res.json({ success: true, wallet });
  } catch (error) {
    res.status(500).json({ message: 'Error al recargar wallet', error: error.message });
  }
});

// @route   POST /api/wallet/spend
// @desc    Gastar moneda virtual (uso interno)
// @access  Private/Admin
router.post('/spend', protect, authorize('admin'), async (req, res) => {
  try {
    const { userId, amount, description } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Usuario y monto válido son requeridos' });
    }

    const wallet = await getOrCreateWallet(userId);
    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Saldo insuficiente' });
    }

    wallet.balance -= amount;
    await addTransaction(wallet, {
      type: 'spend',
      amount,
      description: description || 'Consumo manual',
    });

    res.json({ success: true, wallet });
  } catch (error) {
    res.status(500).json({ message: 'Error al gastar fondos', error: error.message });
  }
});

module.exports = router;

