// components/PurchaseInvoices/NewPurchaseInvoice.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../../utils/GlobalConfig";
import Sidebar from "../../Sidebar";
import jsPDF from "jspdf";
import "jspdf-autotable";

const NewPurchaseInvoice = () => {
  const inputLabels = {
    description: "Item Description",
    quantity: "Quantity",
    rate: "Rate per Unit",
    gst_rate: "GST Rate",
    amount: "Base Amount",
    gst_amount: "GST Amount",
  };

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vendor_name: "",
    invoice_date: "",
    invoice_number: "", // Will be auto-generated
    items: [
      {
        description: "",
        quantity: 1,
        rate: 0,
        gst_rate: 18, // Default GST rate
        gst_amount: 0,
        amount: 0,
      },
    ],
    subtotal: 0,
    total_gst: 0,
    total_amount: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateInvoiceNumber = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");

    // Get the current counter from localStorage
    const currentCounter =
      localStorage.getItem("purchaseInvoiceCounter") || "0";
    const newCounter = (parseInt(currentCounter) + 1)
      .toString()
      .padStart(4, "0");

    // Store the new counter
    localStorage.setItem("purchaseInvoiceCounter", newCounter);

    // Format: PI-YYYYMM-0001
    return `PI-${year}${month}-${newCounter}`;
  };

  const resetCounterIfNewMonth = () => {
    const lastResetDate = localStorage.getItem("lastCounterResetDate");
    const today = new Date();
    const thisMonth = `${today.getFullYear()}-${today.getMonth() + 1}`;

    if (lastResetDate !== thisMonth) {
      localStorage.setItem("purchaseInvoiceCounter", "0");
      localStorage.setItem("lastCounterResetDate", thisMonth);
    }
  };

  // Fetch auto-generated invoice number when component mounts
  useEffect(() => {
    resetCounterIfNewMonth();
    setFormData((prev) => ({
      ...prev,
      invoice_number: generateInvoiceNumber(),
      invoice_date: new Date().toISOString().split("T")[0],
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateItemAmount = (item) => {
    const baseAmount = item.quantity * item.rate;
    const gstAmount = (baseAmount * item.gst_rate) / 100;
    return {
      baseAmount,
      gstAmount,
      totalAmount: baseAmount + gstAmount,
    };
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // Recalculate amounts for this item
    const { baseAmount, gstAmount, totalAmount } = calculateItemAmount(
      newItems[index]
    );
    newItems[index].amount = baseAmount;
    newItems[index].gst_amount = gstAmount;

    // Calculate totals
    const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
    const total_gst = newItems.reduce((sum, item) => sum + item.gst_amount, 0);
    const total_amount = subtotal + total_gst;

    setFormData((prev) => ({
      ...prev,
      items: newItems,
      subtotal,
      total_gst,
      total_amount,
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: "",
          quantity: 1,
          rate: 0,
          gst_rate: 18,
          gst_amount: 0,
          amount: 0,
        },
      ],
    }));
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);

    // Recalculate totals
    const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
    const total_gst = newItems.reduce((sum, item) => sum + item.gst_amount, 0);
    const total_amount = subtotal + total_gst;

    setFormData((prev) => ({
      ...prev,
      items: newItems,
      subtotal,
      total_gst,
      total_amount,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Generate PDF first
      generatePDF();

      // Then submit to backend
      const token = localStorage.getItem("token");
      await axios.post(`${config.API_BASE_URL}/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      alert("Invoice created successfully and PDF has been generated!");
      navigate("/purchase-invoices");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to create purchase invoice"
      );
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Add company logo and header
    doc.setFontSize(20);
    doc.text("Purchase Invoice", pageWidth / 2, 20, { align: "center" });

    // Add invoice details
    doc.setFontSize(12);
    doc.text(`Invoice Number: ${formData.invoice_number}`, 15, 40);
    doc.text(`Date: ${formData.invoice_date}`, 15, 50);
    doc.text(`Vendor: ${formData.vendor_name}`, 15, 60);

    // Add items table
    const tableColumns = [
      "Description",
      "Qty",
      "Rate",
      "GST %",
      "Amount",
      "GST Amt",
      "Total",
    ];

    const tableRows = formData.items.map((item) => [
      item.description,
      item.quantity,
      `₹${item.rate.toFixed(2)}`,
      `${item.gst_rate}%`,
      `₹${item.amount.toFixed(2)}`,
      `₹${item.gst_amount.toFixed(2)}`,
      `₹${(item.amount + item.gst_amount).toFixed(2)}`,
    ]);

    doc.autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 70,
      theme: "grid",
      headStyles: { fillColor: [71, 85, 105] },
      foot: [
        [
          "Subtotal",
          "",
          "",
          "",
          `₹${formData.subtotal.toFixed(2)}`,
          `₹${formData.total_gst.toFixed(2)}`,
          `₹${formData.total_amount.toFixed(2)}`,
        ],
      ],
      footStyles: { fillColor: [241, 245, 249] },
    });

    // Add terms and conditions
    const finalY = doc.previousAutoTable.finalY || 70;
    doc.setFontSize(10);
    doc.text("Terms and Conditions:", 15, finalY + 20);
    doc.text("1. Payment is due within 30 days", 15, finalY + 30);
    doc.text("2. Goods once sold cannot be returned", 15, finalY + 40);

    // Add footer
    doc.setFontSize(10);
    doc.text("Thank you for your business!", pageWidth / 2, finalY + 60, {
      align: "center",
    });

    // Save the PDF
    doc.save(`Purchase_Invoice_${formData.invoice_number}.pdf`);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-6"
        >
          {/* Header Section */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Name *
              </label>
              <input
                type="text"
                name="vendor_name"
                value={formData.vendor_name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                placeholder="Enter vendor name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                value={formData.invoice_number}
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 cursor-not-allowed"
                disabled
              />
              <span className="text-xs text-gray-500">Auto-generated</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Date *
              </label>
              <input
                type="date"
                name="invoice_date"
                value={formData.invoice_date}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Invoice Items</h2>
              <button
                type="button"
                onClick={addItem}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Add Item
              </button>
            </div>

            {/* Item Headers */}
            <div className="grid grid-cols-7 gap-4 mb-2 text-sm font-medium text-gray-700">
              <div className="col-span-2">Description</div>
              <div>Quantity</div>
              <div>Rate (₹)</div>
              <div>GST Rate</div>
              <div>Amount</div>
              <div>Action</div>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-7 gap-4 mb-4">
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantity",
                        parseInt(e.target.value)
                      )
                    }
                    min="1"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "rate",
                        parseFloat(e.target.value)
                      )
                    }
                    min="0"
                    step="0.01"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <select
                    value={item.gst_rate}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "gst_rate",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
                <div className="text-right">
                  <div>₹{item.amount.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">
                    +GST: ₹{item.gst_amount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Section */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Subtotal:</span>
                  <span>₹{formData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Total GST:</span>
                  <span>₹{formData.total_gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Grand Total:</span>
                  <span>₹{formData.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/purchase-invoices")}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPurchaseInvoice;
