import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";

const Invoices = () => {
  const [products, setProducts] = useState([
    { description: "", count: 1, rate: "", amount: "" }
  ]);
  const invoiceRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
  });

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    if (field === "rate" || field === "count") {
      newProducts[index].amount =
        (newProducts[index].count * newProducts[index].rate) || "";
    }
    setProducts(newProducts);
  };

  const addProduct = () => {
    setProducts([...products, { description: "", count: 1, rate: "", amount: "" }]);
  };

  const totalAmount = products.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const sgst = totalAmount * 0.025;
  const cgst = totalAmount * 0.025;
  const grandTotal = totalAmount + sgst + cgst;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg border rounded-lg">
      <div ref={invoiceRef}>
        <h2 className="text-2xl font-bold text-center mb-4">Tax Invoice</h2>

        <div className="mb-4">
          <h3 className="font-bold">To:</h3>
          <p>Sea Hawk Travels Private Limited</p>
          <p>Hadapsar, Pune, Maharashtra - 411028</p>
        </div>

        <div className="mb-4">
          <h3 className="font-bold">From:</h3>
          <p>MATOSHREE FLEET SOLUTIONS PRIVATE LIMITED</p>
          <p>Pune, Maharashtra - 412307</p>
          <p>GSTIN: 27AAUCS1159D1Z4 | PAN: AAUCS1159D</p>
        </div>

        <table className="w-full border-collapse border border-gray-300 mb-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Description</th>
              <th className="border px-4 py-2">Count</th>
              <th className="border px-4 py-2">Rate</th>
              <th className="border px-4 py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={product.description}
                    onChange={(e) => handleProductChange(index, "description", e.target.value)}
                    className="w-full border px-2"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="number"
                    value={product.count}
                    onChange={(e) => handleProductChange(index, "count", e.target.value)}
                    className="w-full border px-2"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="number"
                    value={product.rate}
                    onChange={(e) => handleProductChange(index, "rate", e.target.value)}
                    className="w-full border px-2"
                  />
                </td>
                <td className="border px-4 py-2">{product.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={addProduct} className="bg-green-500 text-white px-4 py-2 rounded">Add Product</button>

        <div className="mt-4">
          <p>SGST @2.5%: Rs. {sgst.toFixed(2)}</p>
          <p>CGST @2.5%: Rs. {cgst.toFixed(2)}</p>
          <p className="font-bold text-lg">Grand Total: Rs. {grandTotal.toFixed(2)}</p>
        </div>

        <div>
          <h3 className="font-bold">Bank Details:</h3>
          <p>Bank: AMANORA PUNE</p>
          <p>Account No: 2221262245805293</p>
          <p>IFSC Code: AUBL0002622</p>
        </div>
      </div>
      <button onClick={handlePrint} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Generate PDF</button>
    </div>
  );
};

export default Invoices;
