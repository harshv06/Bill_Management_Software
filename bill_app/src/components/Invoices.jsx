import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logoImage from "../assets/Logo.png"; // Import your logo
import Sidebar from "./Sidebar";

const Invoices = () => {
  const [products, setProducts] = useState([
    { description: "", hsn: "", quantity: 1, rate: "", amount: "" },
  ]);

  const [invoiceDetails, setInvoiceDetails] = useState({
    billNumber: `INV-${new Date().getFullYear()}-${Math.floor(
      Math.random() * 10000
    )}`,
    billDate: new Date().toLocaleDateString(),
    companyDetails: {
      name: "MATOSHREE FLEET SOLUTIONS PRIVATE LIMITED",
      address:
        "Office No. 201, 2nd Floor, Sai Corporate Park,\nNear Pune-Solapur Highway, Hadapsar, Pune - 411028",
      contact: "+91 9876543210",
      email: "info@matoshreesolutions.com",
      pan: "AAQCM3825L",
      gst: "27AAQCM3825L1ZW",
      stateCode: "27",
    },
    customerDetails: {
      name: "Sea Hawk Travels Private Limited",
      address: "Hadapsar, Pune, Maharashtra - 411028",
      gst: "",
      stateCode: "27",
    },
  });

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    if (field === "rate" || field === "quantity") {
      newProducts[index].amount =
        newProducts[index].quantity * newProducts[index].rate || "";
    }
    setProducts(newProducts);
  };

  const addProduct = () => {
    setProducts([
      ...products,
      {
        description: "",
        hsn: "",
        quantity: 1,
        rate: "",
        amount: "",
      },
    ]);
  };

  const deleteProduct = (indexToRemove) => {
    // Prevent deletion if it's the only product
    if (products.length > 1) {
      setProducts(products.filter((_, index) => index !== indexToRemove));
    } else {
      // Optionally, show a toast or alert
      alert("At least one product is required");
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Calculate totals
    const totalAmount = products.reduce(
      (sum, p) => sum + (parseFloat(p.amount) || 0),
      0
    );
    const sgstRate = 0.025;
    const cgstRate = 0.025;
    const sgst = totalAmount * sgstRate;
    const cgst = totalAmount * cgstRate;
    const grandTotal = totalAmount + sgst + cgst;

    // Custom formatting function to remove footnotes
    const formatNumber = (num, digits = 2) => {
      return num
        .toLocaleString("en-IN", {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        })
        .replace(/¹/g, "");
    };

    // Add Company Logo
    if (logoImage) {
      try {
        doc.addImage(logoImage, "PNG", 0, 15, 40, 40);
      } catch (error) {
        console.error("Logo addition error:", error);
      }
    }

    // Company Name and Address
    doc.setFontSize(16);
    doc.setFont("arial", "bold");
    doc.text(invoiceDetails.companyDetails.name, 100, 25);

    doc.setFontSize(10);
    doc.setFont("arial", "normal");
    doc.text(invoiceDetails.companyDetails.address, 100, 32, {
      maxWidth: 90,
      align: "left",
    });
    doc.text(`Contact: ${invoiceDetails.companyDetails.contact}`, 100, 47);
    doc.text(`Email: ${invoiceDetails.companyDetails.email}`, 100, 52);

    // Invoice Title
    doc.setFontSize(16);
    doc.setFont("arial", "bold");
    doc.text("TAX INVOICE", doc.internal.pageSize.width / 2, 70, {
      align: "center",
    });

    // Billing Details Section
    doc.setFontSize(10);
    doc.setFont("arial", "normal");

    // Left Box (To)
    doc.rect(15, 85, 90, 40);
    doc.text("To:", 20, 93);
    doc.setFont("arial", "bold");
    doc.text(invoiceDetails.customerDetails.name, 20, 100);
    doc.setFont("arial", "normal");
    doc.text(invoiceDetails.customerDetails.address, 20, 107, { maxWidth: 80 });

    // Right Box (From/Invoice Details)
    doc.rect(110, 85, 90, 40);
    doc.text("Invoice Details:", 115, 93);
    doc.text(`Bill No: ${invoiceDetails.billNumber}`, 115, 100);
    doc.text(`Bill Date: ${invoiceDetails.billDate}`, 115, 107);

    // Additional Details Below Boxes
    doc.text(`GST No: ${invoiceDetails.companyDetails.gst}`, 15, 130);
    doc.text(`PAN No: ${invoiceDetails.companyDetails.pan}`, 15, 137);
    doc.text(`State Code: ${invoiceDetails.companyDetails.stateCode}`, 15, 144);

    // Product Table
    const tableColumn = [
      "#",
      "Description",
      "HSN",
      "Quantity",
      "Rate",
      "Amount",
    ];
    const tableRows = products.map((product, index) => [
      index + 1,
      product.description,
      product.hsn,
      product.quantity,
      formatNumber(parseFloat(product.rate)),
      formatNumber(parseFloat(product.amount)),
    ]);

    doc.autoTable({
      startY: 160,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
      },
    });

    // Financial Summary
    const finalY = doc.previousAutoTable.finalY + 10;

    // Use custom formatting for financial details
    doc.text(`Total Amount: ₹${formatNumber(totalAmount)}`, 15, finalY);
    doc.text(
      `SGST @${sgstRate * 100}%: ₹${formatNumber(sgst)}`,
      15,
      finalY + 7
    );
    doc.text(
      `CGST @${cgstRate * 100}%: ₹${formatNumber(cgst)}`,
      15,
      finalY + 14
    );

    doc.setFont("arial", "bold");
    doc.text(`Grand Total: ₹${formatNumber(grandTotal)}`, 15, finalY + 22);

    // Additional Transaction Details
    doc.setFont("arial", "normal");
    doc.text(`PAN No :- ${invoiceDetails.companyDetails.pan}`, 15, finalY + 35);
    doc.text(
      `Provisional GST No :- ${invoiceDetails.companyDetails.gst}`,
      15,
      finalY + 42
    );
    doc.text("HSN /SAC code :- 996412", 15, finalY + 49);
    doc.text("Nature of Transaction :- BUSINESS TO BUSINESS", 15, finalY + 56);
    doc.text("Service Category :- EMPLOYEE TRANSPORTATION", 15, finalY + 63);
    doc.text("Bank Name & Branch :- AMANORA PUNE MH 411028", 15, finalY + 70);
    doc.text("Account No :- 2221262245805293", 15, finalY + 77);
    doc.text("IFSC Code :- AUBL0002622", 15, finalY + 84);

    // Save the PDF
    doc.save(`invoice_${invoiceDetails.billNumber}.pdf`);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto bg-white shadow-lg border rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Generate Invoice</h1>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Customer Details Input */}
            <div>
              <label className="block mb-2">Customer Name</label>
              <input
                type="text"
                value={invoiceDetails.customerDetails.name}
                onChange={(e) =>
                  setInvoiceDetails((prev) => ({
                    ...prev,
                    customerDetails: {
                      ...prev.customerDetails,
                      name: e.target.value,
                    },
                  }))
                }
                className="w-full border px-2 py-1"
              />
            </div>

            {/* Product Input Section */}
            <div>
              <label className="block mb-2">Product Description</label>
              <input
                type="text"
                value={products[0].description}
                onChange={(e) =>
                  handleProductChange(0, "description", e.target.value)
                }
                className="w-full border px-2 py-1"
              />
            </div>
          </div>

          {/* Product Table */}
          <table className="w-full border-collapse border mb-4">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-2 py-1">Description</th>
                <th className="border px-2 py-1">HSN</th>
                <th className="border px-2 py-1">Quantity</th>
                <th className="border px-2 py-1">Rate</th>
                <th className="border px-2 py-1">Amount</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={index}>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      value={product.description}
                      onChange={(e) =>
                        handleProductChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      className="w-full"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      value={product.hsn}
                      onChange={(e) =>
                        handleProductChange(index, "hsn", e.target.value)
                      }
                      className="w-full"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      value={product.quantity}
                      onChange={(e) =>
                        handleProductChange(index, "quantity", e.target.value)
                      }
                      className="w-full"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      value={product.rate}
                      onChange={(e) =>
                        handleProductChange(index, "rate", e.target.value)
                      }
                      className="w-full"
                    />
                  </td>
                  <td className="border px-2 py-1">{product.amount}</td>
                  <td className="border px-2 py-1">
                    {products.length > 1 && (
                      <button
                        onClick={() => deleteProduct(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between">
            <div>
              <button
                onClick={addProduct}
                className="bg-green-500 text-white px-4 py-2 rounded mr-4"
              >
                Add Product
              </button>
            </div>
            <div>
              <button
                onClick={generatePDF}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Generate Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
