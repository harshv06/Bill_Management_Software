// pages/BalanceSheetPage.js
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

const BalanceSheetPage = () => {
  const [balanceSheetData, setBalanceSheetData] = useState({
    liabilities: {
      capitalAccount: 0,
      reservesAndSurplus: 0,
      shareCaptial: 0,
      loansLiability: {
        securedLoans: 0,
      },
      currentLiabilities: {
        provisions: 0,
      },
      profitAndLossAc: {
        openingBalance: 0,
        currentPeriod: 0,
        lessTranferred: 0,
      },
    },
    assets: {
      fixedAssets: {
        total: 0,
        landFixedAsset: 0,
      },
      currentAssets: {
        total: 0,
        loansAndAdvances: 0,
        sundryDebtors: 0,
        cashInHand: 0,
        bankAccounts: 0,
        tdsReceivable: 0,
      },
    },
  });

  const renderBalanceSheet = () => {
    const { liabilities, assets } = balanceSheetData;

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold">
            MATOSHREE FLEET SOLUTIONS PRIVATE LIMITED
          </h1>
          <p className="text-sm">Balance Sheet</p>
          <p className="text-sm">1-Apr-23 to 31-Mar-24</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="font-semibold border-b mb-2">Liabilities</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Capital Account</span>
                <span>₹{liabilities.capitalAccount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Reserves & Surplus</span>
                <span>₹{liabilities.reservesAndSurplus.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Share Capital</span>
                <span>₹{liabilities.shareCaptial.toLocaleString()}</span>
              </div>

              <div className="mt-4">
                <div className="flex justify-between font-semibold">
                  <span>Loans (Liability)</span>
                </div>
                <div className="flex justify-between">
                  <span>Secured Loans</span>
                  <span>
                    ₹{liabilities.loansLiability.securedLoans.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between font-semibold">
                  <span>Current Liabilities</span>
                </div>
                <div className="flex justify-between">
                  <span>Provisions</span>
                  <span>
                    ₹
                    {liabilities.currentLiabilities.provisions.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between font-semibold">
                  <span>Profit & Loss A/c</span>
                </div>
                <div className="flex justify-between">
                  <span>Opening Balance</span>
                  <span>
                    ₹
                    {liabilities.profitAndLossAc.openingBalance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Current Period</span>
                  <span>
                    ₹
                    {liabilities.profitAndLossAc.currentPeriod.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Less: Transferred</span>
                  <span>
                    ₹
                    {liabilities.profitAndLossAc.lessTranferred.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-semibold border-b mb-2">Assets</h2>
            <div className="space-y-2">
              <div className="flex justify-between font-semibold">
                <span>Fixed Assets</span>
                <span>₹{assets.fixedAssets.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs pl-4">
                <span>LAND FIXED ASSET (COMPANY NAME)</span>
                <span>
                  ₹{assets.fixedAssets.landFixedAsset.toLocaleString()}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex justify-between font-semibold">
                  <span>Current Assets</span>
                  <span>₹{assets.currentAssets.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Loans & Advances (Asset)</span>
                  <span>
                    ₹{assets.currentAssets.loansAndAdvances.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sundry Debtors</span>
                  <span>
                    ₹{assets.currentAssets.sundryDebtors.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cash-in-Hand</span>
                  <span>
                    ₹{assets.currentAssets.cashInHand.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Bank Accounts</span>
                  <span>
                    ₹{assets.currentAssets.bankAccounts.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tds Receivable</span>
                  <span>
                    ₹{assets.currentAssets.tdsReceivable.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>₹0</span>
          </div>
        </div>

        {/* <div className="mt-6 flex justify-between text-xs">
          <div>
            <p>RAOSAHEB RAJKUMAR SHINDE</p>
            <p>Digitally signed by RAOSAHEB RAJKUMAR SHINDE</p>
            <p>Date: 2024.10.01 17:09:10 +05:30</p>
          </div>
          <div>
            <p>DHANANJAY ASHOK KOLATE</p>
            <p>Digitally signed by DHANANJAY ASHOK KOLATE</p>
            <p>Date: 2024.10.01 17:08:32 +05:30</p>
          </div>
        </div> */}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Balance Sheet</h1>
        {renderBalanceSheet()}
      </div>
    </div>
  );
};

export default BalanceSheetPage;
