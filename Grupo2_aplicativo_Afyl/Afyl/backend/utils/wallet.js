const Wallet = require('../models/Wallet');

async function getOrCreateWallet(userId) {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId, balance: 0 });
  }
  return wallet;
}

async function addTransaction(wallet, transaction) {
  wallet.transactions.unshift({
    ...transaction,
    createdAt: new Date(),
  });
  // Mantener solo las últimas 100 transacciones
  if (wallet.transactions.length > 100) {
    wallet.transactions = wallet.transactions.slice(0, 100);
  }
  await wallet.save();
  return wallet;
}

module.exports = {
  getOrCreateWallet,
  addTransaction,
};

