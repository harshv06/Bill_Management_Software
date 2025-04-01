// utils/TransactionSyncService.js
import axios from "axios";
import Config from "./GlobalConfig";
import BankAccountService from "./BankAccountService";
import { toast } from "react-hot-toast";

class TransactionSyncService {
  static async createCarPaymentFromDaybook(transactionData) {
    console.log("Transaction Data:", transactionData);
    try {
      // Prepare comprehensive car payment data
      const carPaymentData = {
        ...transactionData,
        amount: parseFloat(transactionData.amount),
        payment_type:
          transactionData.payment_type ||
          (transactionData.transaction_type === "DEBIT" ? "advance" : "others"),
        payment_date: transactionData.transaction_date,
        bank_account_id: transactionData.bank_account_id || null,
        bank_name: transactionData.bank_name || null,
        bank_account_number: transactionData.bank_account_number || null,
        bank_ifsc_code: transactionData.bank_ifsc_code || null,
      };

      // Create car payment
      const carPaymentResponse = await axios.post(
        `${Config.API_BASE_URL}/cars/payments`,
        carPaymentData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Car Payment Response:", carPaymentResponse.data);

      return carPaymentResponse;
    } catch (error) {
      console.error("Error creating car payment:", error);

      // More detailed error handling
      if (error.response) {
        toast.error(
          error.response.data.message || "Failed to create car payment"
        );
      } else {
        toast.error("Error creating car payment");
      }

      throw error;
    }
  }

  static async updateCarPayment(paymentId, updateData) {
    try {
      const updatePaymentData = {
        ...updateData,
        amount: parseFloat(updateData.amount),
        payment_type:
          updateData.payment_type ||
          (updateData.transaction_type === "CREDIT" ? "advance" : "others"),
        payment_date: updateData.transaction_date,
        bank_account_id: updateData.bank_account_id || null,
        bank_name: updateData.bank_name || null,
        bank_account_number: updateData.bank_account_number || null,
        bank_ifsc_code: updateData.bank_ifsc_code || null,
      };

      const response = await axios.put(
        `${Config.API_BASE_URL}/cars/payments/update/${paymentId}`,
        updatePaymentData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Updated Car Payment:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating car payment:", error);
      throw error;
    }
  }

  static async updateDaybookTransaction(transactionId, updateData) {
    try {
      const transactions = await axios.get(
        `${Config.API_BASE_URL}/daybook/transactions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const transaction = transactions.data.data;
      console.log("Daybook Transactions:", transaction);
      // Find the transaction with matching reference number
      const matchingTransaction = transaction.find((transaction) => {
        // Split the reference number and compare the third part
        const referenceParts = transaction.reference_number.split("-");

        // Convert both to strings and compare
        const referenceIdPart = referenceParts[2]
          ? referenceParts[2].toString()
          : "";
        const inputTransactionId = transactionId.toString();

        console.log("Reference ID Part:", referenceIdPart);
        console.log("Input Transaction ID:", inputTransactionId);

        return referenceIdPart === inputTransactionId;
      });

      // If no matching transaction found, throw an error
      if (!matchingTransaction) {
        throw new Error(
          `No daybook transaction found for car payment ID: ${transactionId}`
        );
      }

      console.log("Matching Daybook Transaction:", matchingTransaction);
      const response = await axios.put(
        `${Config.API_BASE_URL}/daybook/transactions/${matchingTransaction.transaction_id || matchingTransaction.transactionId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating daybook transaction:", error);
      throw error;
    }
  }

  static async syncTransaction(source, transactionId, updateData) {
    console.log("Source:", source, transactionId);
    try {
      switch (source) {
        case "car_payment":
          return await this.updateCarPayment(transactionId, updateData);
        case "daybook":
          return await this.updateDaybookTransaction(transactionId, updateData);
        default:
          throw new Error("Invalid update source");
      }
    } catch (error) {
      console.error("Error syncing transaction:", error);
      throw error;
    }
  }

  static async createDaybookFromCarPayment(carPaymentData) {
    console.log("Car Payment Data:", carPaymentData);
    try {
      const transactionDate =
        carPaymentData.transaction_date instanceof Date
          ? carPaymentData.transaction_date
          : new Date(carPaymentData.transaction_date);

      const processedData = {
        ...carPaymentData,
        transaction_date: transactionDate.toISOString(),
      };

      const response = await axios.post(
        `${Config.API_BASE_URL}/daybook/transactions`,
        processedData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error creating daybook transaction from car payment:",
        error
      );
      throw error;
    }
  }

  static async updateDaybookFromCarPayment(carPaymentData) {
    try {
      const response = await axios.put(
        `${Config.API_BASE_URL}/daybook/transactions/${carPaymentData.transaction_id}`,
        carPaymentData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error updating daybook transaction from car payment:",
        error
      );
      throw error;
    }
  }

  static async deleteDaybookTransactionFromCarPayment(transactionId) {
    console.log("Car Payment ID:", transactionId);

    try {
      // Fetch all daybook transactions
      const response = await axios.get(
        `${Config.API_BASE_URL}/daybook/transactions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const daybookTransactions = response.data.data;

      // Find the transaction with matching reference number
      const matchingTransaction = daybookTransactions.find((transaction) => {
        // Split the reference number and compare the third part
        const referenceParts = transaction.reference_number.split("-");

        // Convert both to strings and compare
        const referenceIdPart = referenceParts[2]
          ? referenceParts[2].toString()
          : "";
        const inputTransactionId = transactionId.toString();

        console.log("Reference ID Part:", referenceIdPart);
        console.log("Input Transaction ID:", inputTransactionId);

        return referenceIdPart === inputTransactionId;
      });

      // If no matching transaction found, throw an error
      if (!matchingTransaction) {
        throw new Error(
          `No daybook transaction found for car payment ID: ${transactionId}`
        );
      }

      // Delete the matching daybook transaction
      const deleteResponse = await axios.delete(
        `${Config.API_BASE_URL}/daybook/transactions/${matchingTransaction.transaction_id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Deleted Daybook Transaction:", matchingTransaction);
      return deleteResponse.data;
    } catch (error) {
      console.error(
        "Error deleting daybook transaction from car payment:",
        error
      );
      throw error;
    }
  }

  static async deleteCarPayment(paymentId) {
    try {
      console.log("Payment ID:", paymentId);
      const response = await axios.delete(
        `${Config.API_BASE_URL}/cars/payments/delete/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Error deleting car payment:", error);
      throw error;
    }
  }

  static async addDaybookTransactionFromSalesInvoice(transactionData) {}
}

export default TransactionSyncService;
