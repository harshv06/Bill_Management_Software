import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import BankAccountDashboard from "../components/BankAccount/BankAccountDashboard";

const BankReconciliationPage = () => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-grow bg-gray-100">
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Bank Reconciliation</h1>

          {/* Bank Account Dashboard Component */}
          <BankAccountDashboard />
        </div>
      </div>
    </div>
  );
};

export default BankReconciliationPage;
