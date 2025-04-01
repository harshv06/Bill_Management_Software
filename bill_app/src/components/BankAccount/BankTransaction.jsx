import React, { useState } from 'react';
import BankAccountService from '../../utils/BankAccountService';

const BankTransactionModal = ({ 
  isOpen, 
  onClose, 
  accountId 
}) => {
  const [formData, setFormData] = useState({
    transaction_type: 'CREDIT',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    category: '',
    reference_number: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await BankAccountService.recordBankTransaction({
        ...formData,
        account_id: accountId
      });
      onClose();
    } catch (error) {
      toast.error('Transaction failed');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg w-[500px]">
        <h2 className="text-xl font-bold mb-6">Add Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div>
            <label>Transaction Type</label>
            <select
              value={formData.transaction_type}
              onChange={(e) => setFormData({
                ...formData, 
                transaction_type: e.target.value
              })}
              className="w-full p-2 border rounded"
            >
              <option value="CREDIT">Credit</option>
              <option value="DEBIT">Debit</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label>Amount</label>
            <input 
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({
                ...formData, 
                amount: e.target.value
              })}
              required
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Other Fields */}
          <div className="flex justify-end space-x-2">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankTransactionModal;