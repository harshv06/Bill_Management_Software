const MonthlyBalanceCard = ({ balance, totalCurrentBalance }) => {
  if (!balance) return null;

  return (
    <div className="grid grid-cols-5 gap-4 mb-6"> {/* Changed to 5 columns */}
      {/* <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm">Opening Balance</h3>
        <p className="text-2xl font-bold">₹{balance.opening_balance.toLocaleString()}</p>
      </div> */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm">Total Credits</h3>
        <p className="text-2xl font-bold text-green-600">
          ₹{balance.total_credits.toLocaleString()}
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm">Total Debits</h3>
        <p className="text-2xl font-bold text-red-600">
          ₹{balance.total_debits.toLocaleString()}
        </p>
      </div>
      {/* <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm">Closing Balance</h3>
        <p className="text-2xl font-bold">₹{balance.closing_balance.toLocaleString()}</p>
      </div> */}
      {/* New card for Total Current Balance */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm">Total Current Balance</h3>
        <p className="text-2xl font-bold text-blue-600">
          ₹{totalCurrentBalance.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default MonthlyBalanceCard