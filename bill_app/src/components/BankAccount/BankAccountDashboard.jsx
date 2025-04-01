import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  //   BankIcon,
  RefreshIcon,
  FilterIcon,
  DownloadIcon,
} from "@heroicons/react/outline";
import BankAccountModal from "../BankAccount/BankAccount";
import BankTransactionModal from "../BankAccount/BankTransaction";
import BankAccountService from "../../utils/BankAccountService";
import toast from "react-hot-toast";
import BankAccountTransactions from "./BankAccountTransaction";
import { useAuth } from "../../context/AuthContext";
const BankAccountDashboard = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl + A
      if (e.ctrlKey && e.key === "a") {
        e.preventDefault();
        setIsAccountModalOpen(true);
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    setLoading(true);
    try {
      const response = await BankAccountService.getAllBankAccounts();
      console.log(response.data.data);
      setBankAccounts(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch bank accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (accountData) => {
    try {
      console.log(accountData);
      await BankAccountService.createBankAccount(accountData);
      fetchBankAccounts();
      setIsAccountModalOpen(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSelectAccount = (account) => {
    setSelectedAccount(account);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Bank Accounts List */}
      <div className="w-1/4 bg-white border-r p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Bank Accounts</h2>
          {user.permissions.includes("bank_reconciliation:create") && (
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {bankAccounts.map((account) => (
          <div
            key={account.account_id}
            onClick={() => handleSelectAccount(account)}
            className={`
              p-3 mb-2 cursor-pointer rounded 
              ${
                selectedAccount?.account_id === account.account_id
                  ? "bg-blue-100 border-blue-500"
                  : "hover:bg-gray-100"
              }
            `}
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{account.bank_name}</h3>
                <p className="text-sm text-gray-500">
                  {account.account_number.slice(-4)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">
                  ₹{account.current_balance.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{account.account_type}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content - Transactions */}
      <div className="w-3/4 p-6">
        {selectedAccount ? (
          <BankAccountTransactions
            account={selectedAccount}
            onAddTransaction={() => setIsTransactionModalOpen(true)}
          />
        ) : (
          <div className="text-center text-gray-500">
            Select an account to view transactions
          </div>
        )}
      </div>

      {/* Modals */}
      {isAccountModalOpen && (
        <BankAccountModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          onCreate={(accountData) => {
            // Handle account creation logic
            handleCreateAccount(accountData);

            setIsAccountModalOpen(false);
          }}
        />
      )}

      {isTransactionModalOpen && selectedAccount && (
        <BankTransactionModal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          accountId={selectedAccount.account_id}
        />
      )}
    </div>
  );
};

export default BankAccountDashboard;
