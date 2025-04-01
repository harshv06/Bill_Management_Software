import axios from "axios";
import config from "./GlobalConfig";

class BankAccountService {
  static async getAllBankAccounts() {
    return axios.get(`${config.API_BASE_URL}/bank/accounts`);
  }

  static async createBankAccount(accountData) {
    return axios.post(`${config.API_BASE_URL}/bank/accounts`, accountData);
  }

  static async getAccountTransactions(accountId, filters) {
    return axios.get(`${config.API_BASE_URL}/bank/transactions/${accountId}`, {
      params: filters,
    });
  }

  static async getAllBankAccountsWithBalance() {
    return axios.get(`${config.API_BASE_URL}/bank/accounts`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  }

  static async recordBankTransaction(transactionData) {
    return axios.post(
      `${config.API_BASE_URL}/bank/transactions`,
      transactionData
    );
  }

  static async reconcileTransactions(transactionIds) {
    return axios.post(`${config.API_BASE_URL}/bank/transactions/reconcile`, {
      transactionIds,
    });
  }

  static async updateAccountBalanceWithComparison(balanceUpdateData) {
    try {
      // Validate required fields client-side
      this.validateBalanceUpdateData(balanceUpdateData);
  
      // Add more comprehensive data for server-side calculation
      const enhancedBalanceUpdateData = {
        ...balanceUpdateData,
        // Add additional context for more accurate calculation
        adjustment_type: balanceUpdateData.original_bank_account_id !== balanceUpdateData.bank_account_id 
          ? 'CROSS_ACCOUNT' 
          : 'SAME_ACCOUNT'
      };
      console.log("Enhanced Balance Update Data:", enhancedBalanceUpdateData);
      // Make an API call to backend for balance update
      const response = await axios.put(
        `${config.API_BASE_URL}/bank/accounts/balance-adjustment`,
        enhancedBalanceUpdateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      return response.data;
    } catch (error) {
      console.error("Balance update error:", error);
      
      // More detailed error logging
      if (error.response) {
        console.error("Server responded with:", error.response.data);
      }
      
      throw error;
    }
  }

  static validateBalanceUpdateData(data) {
    const requiredFields = [
      "bank_account_id",
      "original_amount",
      "original_transaction_type",
      "new_amount",
      "new_transaction_type",
    ];

    // Check for missing fields
    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    // Additional validations
    if (
      parseFloat(data.original_amount) < 0 ||
      parseFloat(data.new_amount) < 0
    ) {
      throw new Error("Amount cannot be negative");
    }

    // Validate transaction types
    const validTransactionTypes = ["CREDIT", "DEBIT"];
    if (
      !validTransactionTypes.includes(data.original_transaction_type) ||
      !validTransactionTypes.includes(data.new_transaction_type)
    ) {
      throw new Error("Invalid transaction type");
    }
  }

  static calculateBalanceAdjustment(
    currentBalance,
    originalAmount,
    newAmount,
    originalTransactionType,
    newTransactionType
  ) {
    const numericCurrentBalance = parseFloat(currentBalance);
    const numericOriginalAmount = parseFloat(originalAmount);
    const numericNewAmount = parseFloat(newAmount);

    // Scenario 1: No change in transaction type
    if (originalTransactionType === newTransactionType) {
      const amountDifference = numericNewAmount - numericOriginalAmount;

      return newTransactionType === "CREDIT"
        ? numericCurrentBalance + amountDifference
        : numericCurrentBalance - amountDifference;
    }

    // Scenario 2: Switching from CREDIT to DEBIT
    if (
      originalTransactionType === "CREDIT" &&
      newTransactionType === "DEBIT"
    ) {
      return numericCurrentBalance - numericOriginalAmount - numericNewAmount;
    }

    // Scenario 3: Switching from DEBIT to CREDIT
    if (
      originalTransactionType === "DEBIT" &&
      newTransactionType === "CREDIT"
    ) {
      return numericCurrentBalance + numericOriginalAmount + numericNewAmount;
    }

    // Fallback
    return numericCurrentBalance;
  }

  static async updateAccountBalance(accountId, data) {
    console.log("Updated Balance :", data, accountId);
    return axios.put(
      `${config.API_BASE_URL}/bank/accounts/${accountId}/balance`,
      data
    );
  }

  static async updateBankTransactionBalance(
    referenceNumber,
    updateData,
    transaction
  ) {
    const bankTransaction = await this.findBankTransactionByReference(
      referenceNumber,
      transaction
    );

    return bankTransaction.update(
      {
        amount: updateData.amount,
        transaction_type: updateData.transaction_type,
        balance_after_transaction: updateData.balance_after_transaction,
      },
      { transaction }
    );
  }


  static async revertTransactionBalance(balanceRevertData) {
    try {
      // Validate input data
      this.validateBalanceRevertData(balanceRevertData);
  
      // Make an API call to backend for balance reversion
      const response = await axios.post(
        `${config.API_BASE_URL}/bank/accounts/revert-transaction-balance`,
        balanceRevertData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      return response.data;
    } catch (error) {
      console.error("Balance revert error:", error);
      
      // More detailed error logging
      if (error.response) {
        console.error("Server responded with:", error.response.data);
      }
      
      throw error;
    }
  }
  
  static validateBalanceRevertData(data) {
    const requiredFields = [
      "bank_account_id",
      "amount",
      "transaction_type",
      "reference_number",
    ];
  
    // Check for missing fields
    const missingFields = requiredFields.filter((field) => !data[field]);
  
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }
  
    // Validate amount
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount < 0) {
      throw new Error("Invalid amount");
    }
  
    // Validate transaction type
    const validTransactionTypes = ["CREDIT", "DEBIT"];
    if (!validTransactionTypes.includes(data.transaction_type)) {
      throw new Error("Invalid transaction type");
    }
  }
}

export default BankAccountService;
