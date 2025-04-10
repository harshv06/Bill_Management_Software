import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  FaFileInvoice,
  FaBuilding,
  FaCalendar,
  FaMoneyBillWave,
  FaTags,
} from "react-icons/fa";
import logoImage from "../../../assets/LetterHead.png";
import { useState } from "react";
import { FaEdit, FaMoneyBill, FaSave } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import Config from "../../../utils/GlobalConfig";

const InvoiceDetailsModal = ({
  isOpen,
  onClose,
  invoice,
  onDownload,
  onUpdate,
}) => {
  console.log(invoice);
  const [isEditing, setIsEditing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState(invoice);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  if (!isOpen || !invoice) return null;

  const [invoiceDetails, setInvoiceDetails] = useState({
    billNumber: `INV-${new Date().getFullYear()}-${Math.floor(
      Math.random() * 10000
    )}`,
    billDate: new Date().toLocaleDateString(),
    companyDetails: {
      name: "MATOSHREE FLEET SOLUTIONS PRIVATE \nLIMITED",
      address:
        "Office No. 201, 2nd Floor,\nSai Corporate Park, Near Pune-Solapur Highway,\nHadapsar, Pune - 411028",
      contact: "+91 9876543210",
      email: "info@matoshreesolutions.com",
      pan: "AAQCM3825L",
      gst: "27AAQCM3825L1ZW",
      stateCode: "27",
      date: new Date().toLocaleDateString(),
    },
    customerDetails: {
      company_id: 1 || "", // Use passed companyId
      name: "",
      address: "",
      gst: "",
      stateCode: "27",
    },
  });

  // const generatePDF = async () => {
  //   console.log(invoice);
  //   try {
  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: "a4",
  //     });

  //     const letterheadImage = new Image();

  //     // A4 dimensions in points
  //     const pageWidth = 595.28;
  //     const pageHeight = 841.89;

  //     // Load letterhead image
  //     await new Promise((resolve, reject) => {
  //       letterheadImage.onload = () => {
  //         // Add letterhead image to PDF
  //         doc.addImage(
  //           letterheadImage,
  //           "PNG",
  //           0,
  //           0,
  //           pageWidth,
  //           175 * (pageWidth / 991)
  //         );
  //         resolve();
  //       };
  //       letterheadImage.onerror = () => {
  //         reject(new Error("Failed to load letterhead image"));
  //       };
  //       letterheadImage.src = logoImage;
  //     });

  //     // Adjust startY to account for letterhead height
  //     const letterheadHeight = 175 * (pageWidth / 991);

  //     // Number formatting function
  //     const formatNumber = (num, digits = 2) => {
  //       return num.toLocaleString("en-IN", {
  //         minimumFractionDigits: digits,
  //         maximumFractionDigits: digits,
  //       });
  //     };

  //     // Calculate totals
  //     const totalAmount = invoice.total_amount;
  //     const gstAmount = {
  //       sgst: parseFloat(invoice.sgst_amount),
  //       cgst: parseFloat(invoice.cgst_amount),
  //     };
  //     const grandTotal = parseFloat(invoice.grand_total);

  //     // Tax Invoice Title
  //     doc.setFontSize(16);
  //     doc.setFont("arial", "bold");
  //     doc.rect(30, letterheadHeight + 20, 520, 30);
  //     doc.text(
  //       "TAX INVOICE",
  //       doc.internal.pageSize.width / 2,
  //       letterheadHeight + 40,
  //       { align: "center" }
  //     );

  //     // Billing Details Section
  //     doc.setFontSize(10);
  //     doc.setFont("arial", "normal");

  //     // To Section (Customer Details)
  //     doc.rect(30, letterheadHeight + 50, 270, 110);
  //     doc.text("To:", 40, letterheadHeight + 75);
  //     doc.setFont("arial", "bold");
  //     doc.text(invoice.customer_name, 40, letterheadHeight + 90);
  //     doc.setFont("arial", "normal");
  //     // Note: You might want to add a method to get full address if available
  //     doc.text(invoice.invoiceCompany.address, 40, letterheadHeight + 105, {
  //       maxWidth: 230,
  //     });

  //     // Company Details Section
  //     doc.rect(300, letterheadHeight + 50, 250, 110);
  //     doc.text("From:", 310, letterheadHeight + 75);
  //     doc.setFont("arial", "bold");
  //     doc.text(
  //       "Matoshree Fleet Solutions", // Replace with your actual company name
  //       310,
  //       letterheadHeight + 90
  //     );
  //     doc.setFont("arial", "normal");
  //     doc.text(
  //       "Office No. 201, 2nd Floor,\nSai Corporate Park, Near Pune-Solapur Highway,\nHadapsar, Pune - 411028", // Replace with your actual company address
  //       310,
  //       letterheadHeight + 120
  //     );

  //     // Additional Details
  //     doc.rect(30, letterheadHeight + 160, 270, 50);
  //     doc.text(
  //       `GST No: ${invoice.company?.gst_number || "N/A"}`,
  //       40,
  //       letterheadHeight + 175
  //     );
  //     // Add more details as needed

  //     doc.rect(300, letterheadHeight + 160, 250, 50);
  //     doc.text(
  //       `Invoice Date: ${new Date(invoice.invoice_date).toLocaleDateString()}`,
  //       310,
  //       letterheadHeight + 175
  //     );
  //     doc.text(
  //       `Invoice No: ${invoice.invoice_number}`,
  //       310,
  //       letterheadHeight + 190
  //     );

  //     // Product Table
  //     const tableColumn = [
  //       "#",
  //       "Description",
  //       "HSN",
  //       "Quantity",
  //       "Rate",
  //       "Amount",
  //     ];
  //     const tableRows =
  //       invoice.invoiceItems?.map((item, index) => [
  //         index + 1,
  //         item.description,
  //         item.hsn_code,
  //         item.quantity,
  //         formatNumber(parseFloat(item.rate)),
  //         formatNumber(parseFloat(item.amount)),
  //       ]) || [];

  //     doc.autoTable({
  //       startY: letterheadHeight + 230,
  //       startX: 20,
  //       head: [tableColumn],
  //       body: tableRows,
  //       theme: "grid",
  //       styles: {
  //         fontSize: 9,
  //         cellPadding: 5,
  //         overflow: "linebreak",
  //         columnWidth: "wrap",
  //       },
  //       headStyles: {
  //         fillColor: [41, 128, 185],
  //         textColor: 255,
  //       },
  //       columnStyles: {
  //         0: { width: 20 },
  //         1: { width: 150 },
  //         2: { width: 50 },
  //         3: { width: 50 },
  //         4: { width: 50 },
  //         5: { width: 50 },
  //       },
  //     });

  //     // Financial Summary
  //     const finalY = doc.previousAutoTable.finalY + 20;

  //     doc.setFontSize(10);
  //     doc.text(`Total Amount: ${formatNumber(totalAmount)}`, 30, finalY);
  //     doc.text(
  //       `SGST @${((gstAmount.sgst / totalAmount) * 100).toFixed(
  //         2
  //       )}%: ${formatNumber(gstAmount.sgst)}`,
  //       30,
  //       finalY + 20
  //     );
  //     doc.text(
  //       `CGST @${((gstAmount.cgst / totalAmount) * 100).toFixed(
  //         2
  //       )}%: ${formatNumber(gstAmount.cgst)}`,
  //       30,
  //       finalY + 40
  //     );

  //     doc.setFont("arial", "bold");
  //     doc.text(`Grand Total: ${formatNumber(grandTotal)}`, 32, finalY + 60);

  //     // Additional Transaction Details
  //     doc.setFont("arial", "bold");
  //     doc.rect(30, finalY + 70, 200, 150);

  //     // Add more details as in your original template
  //     doc.text("PAN No :-", 35, finalY + 85);
  //     doc.text("Your PAN Number", 240, finalY + 85);

  //     // Save the PDF
  //     doc.save(`invoice_${invoice.invoice_number}.pdf`);
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //     // Optionally show an error toast
  //   }
  // };

  // Helper function to render status badge

  const generatePDF = async () => {
    try {
      setLoading(true);
      setError(null);

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const letterheadImage = new Image();

      // A4 dimensions in points
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      await new Promise((resolve, reject) => {
        letterheadImage.onload = () => {
          // Add letterhead image to PDF
          doc.addImage(
            letterheadImage,
            "PNG",
            0,
            0,
            pageWidth,
            175 * (pageWidth / 991)
          );
          resolve();
        };
        letterheadImage.onerror = () => {
          reject(new Error("Failed to load letterhead image"));
        };
        letterheadImage.src = logoImage;
      });

      // Adjust startY to account for letterhead height
      const letterheadHeight = 175 * (pageWidth / 991);

      // Calculate totals with improved precision
      const totalAmount = invoice.total_amount;

      const grandTotal =
        invoice.grand_total

      // Number formatting function
      const formatNumber = (num, digits = 2) => {
        return num.toLocaleString("en-IN", {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        });
      };
      const convertToWords = (num) => {
        const a = [
          "",
          "One ",
          "Two ",
          "Three ",
          "Four ",
          "Five ",
          "Six ",
          "Seven ",
          "Eight ",
          "Nine ",
          "Ten ",
          "Eleven ",
          "Twelve ",
          "Thirteen ",
          "Fourteen ",
          "Fifteen ",
          "Sixteen ",
          "Seventeen ",
          "Eighteen ",
          "Nineteen ",
        ];
        const b = [
          "",
          "",
          "Twenty ",
          "Thirty ",
          "Forty ",
          "Fifty ",
          "Sixty ",
          "Seventy ",
          "Eighty ",
          "Ninety ",
        ];

        function inWords(n) {
          if (n < 20) return a[n];
          const digit = Math.floor(n / 10);
          const remainder = n % 10;
          return b[digit] + (remainder > 0 ? a[remainder] : "");
        }

        const crore = Math.floor(num / 10000000);
        const lakhs = Math.floor((num % 10000000) / 100000);
        const thousands = Math.floor((num % 100000) / 1000);
        const hundreds = Math.floor(num % 1000);

        let result = "";
        if (crore > 0) result += inWords(crore) + "Crore ";
        if (lakhs > 0) result += inWords(lakhs) + "Lakh ";
        if (thousands > 0) result += inWords(thousands) + "Thousand ";
        if (hundreds > 0) result += inWords(hundreds);

        return result.trim() + " Only";
      };

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(
        "TAX INVOICE",
        doc.internal.pageSize.width / 2,
        letterheadHeight + 40,
        {
          align: "center",
        }
      );

      // Billing Details Section
      doc.setFontSize(10);

      // To Section (Customer Details)
      doc.rect(30, letterheadHeight + 50, 270, 110);
      // doc.rect(30, letterheadHeight + 40, 260, 80);
      doc.setFont("helvetica", "normal");
      doc.text("To:", 40, letterheadHeight + 75);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(invoice.invoiceCompany.company_name, 40, letterheadHeight + 90);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(invoice.invoiceCompany.address, 40, letterheadHeight + 105, {
        maxWidth: 250,
      });

      // Invoice Details Section
      doc.rect(300, letterheadHeight + 50, 250, 110);
      doc.setFont("helvetica", "normal");
      doc.text("From:", 310, letterheadHeight + 75);
      // doc.text("Invoice Details:", 310, letterheadHeight + 75);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(
        `${invoiceDetails.companyDetails.name}`,
        310,
        letterheadHeight + 90
      );
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(
        `Registered Address: ${invoiceDetails.companyDetails.address}`,
        310,
        letterheadHeight + 120
      );

      // Additional Details
      doc.rect(30, letterheadHeight + 160, 270, 50);
      doc.text(
        `GST No: ${invoiceDetails.customerDetails.gst || "N/A"}`,
        40,
        letterheadHeight + 175
      );
      doc.text(
        `PAN No: ${invoiceDetails.companyDetails.pan}`,
        40,
        letterheadHeight + 190
      );
      doc.text(
        `State Code: ${invoiceDetails.companyDetails.stateCode}`,
        40,
        letterheadHeight + 205
      );

      doc.rect(300, letterheadHeight + 160, 250, 50);
      doc.text(
        `Invoice Date: ${invoiceDetails.companyDetails.date || "N/A"}`,
        310,
        letterheadHeight + 175
      );
      doc.text(
        `Invoice No: ${invoiceDetails.billNumber}`,
        310,
        letterheadHeight + 190
      );

      // Product Table
      const tableColumn = [
        "#",
        "Description",
        "HSN",
        "Quantity",
        "Rate",
        "Amount",
      ];
      const tableRows = invoice.invoiceItems.map((product, index) => [
        index + 1,
        product.description,
        product.hsn,
        product.quantity,
        formatNumber(parseFloat(product.rate)),
        formatNumber(parseFloat(product.amount)),
      ]);

      doc.autoTable({
        startY: letterheadHeight + 230,
        startX: 20,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        styles: {
          fontSize: 12,
          cellPadding: 5,
          overflow: "linebreak",
          columnWidth: "wrap",
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
        },
        columnStyles: {
          0: { width: 20 },
          1: { width: 150 },
          2: { width: 50 },
          3: { width: 50 },
          4: { width: 50 },
          5: { width: 50 },
        },
      });

      // Financial Summary
      const finalY = doc.previousAutoTable.finalY + 20;

      doc.setFontSize(12);
      // Update the tax section in PDF
      doc.text(`Total Amount: ${formatNumber(totalAmount)}`, 30, finalY);

      doc.text(
        `SGST : ${formatNumber(invoice.sgst_amount)}`,
        30,
        finalY + 20
      );
      doc.text(
        `CGST : ${formatNumber(invoice.cgst_amount)}`,
        30,
        finalY + 40
      );

      doc.setFont("arial", "bold");
      doc.setFontSize(14);
      doc.text(`Grand Total: ${formatNumber(grandTotal)}`, 30, finalY + 60);

      doc.setFont("arial", "bold");
      doc.setFontSize(14);
      doc.rect(30, finalY + 250, 210, 160);
      doc.text(`PAN No :-`, 35, finalY + 285);

      doc.text(`${invoiceDetails.companyDetails.pan}`, 250, finalY + 285);

      doc.text(`Provisional GST No :-`, 35, finalY + 305);

      doc.text(
        `${invoiceDetails.customerDetails.gst || "N/A"}`,
        250,
        finalY + 305
      );
      doc.text("HSN /SAC code :-", 35, finalY + 325);
      doc.text("996412", 250, finalY + 325);

      doc.text("Nature of Transaction :-", 35, finalY + 345);

      doc.text("BUSINESS TO BUSINESS", 250, finalY + 345);

      doc.text("Service Category :-", 35, finalY + 365);
      doc.text("EMPLOYEE TRANSPORTATION", 250, finalY + 365);
      doc.text("Bank Name & Branch :-", 35, finalY + 385);
      doc.text("AMANORA PUNE MH 411028", 250, finalY + 385);
      doc.text("Account No :-", 35, finalY + 400);
      doc.text("2221262245805293", 250, finalY + 400);
      doc.text("IFSC Code :-", 35, finalY + 420);
      doc.text("AUBL0002622", 250, finalY + 420);

      doc.rect(240, finalY + 250, 300, 160);

      // Save the PDF
      doc.save(`invoice_${invoiceDetails.billNumber}.pdf`);
      // addDataToDB(products, invoiceDetails);
      saveInvoiceToDB(products, invoiceDetails);
      onClose();
    } catch (error) {
      console.error("Error adding letterhead image:", error);
      toast.error("Failed to add letterhead image");
    }
  };

  const renderStatusBadge = (status) => {
    const statusColors = {
      draft: "bg-yellow-100 text-yellow-800",
      sent: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status]}`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  // Calculate total tax
  const totalTax =
    parseFloat(invoice.sgst_amount) + parseFloat(invoice.cgst_amount);

  // Add this section after the Financial Summary in the return statement
  const PaymentSection = () => {
    // Calculate remaining amount
    const totalAmount = parseFloat(invoice.grand_total);
    const amountPaid = parseFloat(invoice.amount_paid || 0);
    const remainingAmount = totalAmount - amountPaid;

    return (
      <div className="bg-white p-6 rounded-lg border mt-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <FaMoneyBill className="mr-3 text-blue-500" />
          Payment Status
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-xl font-bold">₹{totalAmount.toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Amount Paid</p>
            <p className="text-xl font-bold text-green-600">
              ₹{amountPaid.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Remaining Amount</p>
            <p className="text-xl font-bold text-red-600">
              ₹{remainingAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Payment Status Badge */}
        <div className="mt-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              invoice.payment_status === "fully_paid"
                ? "bg-green-100 text-green-800"
                : invoice.payment_status === "partially_paid"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {invoice.payment_status?.toUpperCase() || "UNPAID"}
          </span>
        </div>

        {/* Payment History */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">Payment History</h4>
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border p-2 text-left">Date</th>
                    <th className="border p-2 text-left">Amount</th>
                    <th className="border p-2 text-left">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments.map((payment, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border p-2">
                        {new Date(
                          payment.transaction_date
                        ).toLocaleDateString()}
                      </td>
                      <td className="border p-2">₹{payment.amount}</td>
                      <td className="border p-2">{payment.payment_method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Record Payment Button */}
        {remainingAmount > 0 && (
          <button
            onClick={() => setShowPaymentModal(true)}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center"
          >
            <FaMoneyBill className="mr-2" /> Record Payment
          </button>
        )}
      </div>
    );
  };

  // Add Payment Modal
  const PaymentModal = () => (
    <div
      className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowPaymentModal(false);
        }
      }}
    >
      <div
        className="bg-white rounded-lg p-6 w-96 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold mb-4">Record Payment</h3>
        <form onSubmit={handlePaymentSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Remaining Amount: ₹
              {(invoice.grand_total - (invoice.amount_paid || 0)).toFixed(2)}
            </label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => {
                // Prevent negative values and limit to remaining amount
                const value = Math.min(
                  invoice.grand_total - (invoice.amount_paid || 0),
                  Math.max(0, parseFloat(e.target.value) || 0)
                );
                setPaymentAmount(value.toString());
              }}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              max={invoice.grand_total - (invoice.amount_paid || 0)}
              step="0.01"
              required
              placeholder="Enter payment amount"
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="upi">UPI</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Record Payment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${Config.API_BASE_URL}/invoices/${invoice.invoice_id}/payment`,
        {
          amount: parseFloat(paymentAmount),
          payment_method: paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        toast.success("Payment recorded successfully");
        setShowPaymentModal(false);
        console.log(response);
        // Update the entire invoice data
        const updatedInvoice = {
          ...invoice,
          amount_paid: response.data.data.amount_paid,
          payment_status: response.data.data.payment_status,
          payments: response.data.data.payments,
        };

        // Call the onUpdate prop to update the invoice in parent component
        if (onUpdate) {
          onUpdate(updatedInvoice);
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add these buttons to the Modal Footer
  const ModalFooter = () => (
    <div className="flex justify-between p-6 border-t">
      <div>
        {/* {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition flex items-center"
          >
            <FaEdit className="mr-2" /> Edit Invoice
          </button>
        ) : (
          <button
            onClick={() => {
              onUpdate(editedInvoice);
              setIsEditing(false);
            }}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition flex items-center"
          >
            <FaSave className="mr-2" /> Save Changes
          </button>
        )} */}
      </div>
      <div className="flex space-x-4">
        {/* <button
          onClick={generatePDF}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition flex items-center"
        >
          <FaFileInvoice className="mr-2" /> Download Invoice
        </button> */}
        <button
          onClick={onClose}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaFileInvoice className="mr-3 text-blue-500" />
            Invoice Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Invoice Summary */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center">
                <FaTags className="mr-2 text-blue-500" />
                Invoice Number
              </h3>
              <p className="text-lg font-bold">{invoice.invoice_number}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center">
                <FaCalendar className="mr-2 text-blue-500" />
                Invoice Date
              </h3>
              <p className="text-lg">
                {new Date(invoice.invoice_date).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center">
                <FaMoneyBillWave className="mr-2 text-blue-500" />
                Status
              </h3>
              {renderStatusBadge(invoice.status)}
            </div>
          </div>

          {/* Company Details */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaBuilding className="mr-3 text-blue-500" />
              Company Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-gray-700">Company Name</p>
                <p>{invoice.customer_name}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">GST Number</p>
                <p>{invoice.company?.gst_number || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Invoice Items</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left">Description</th>
                  <th className="border p-3 text-left">HSN Code</th>
                  <th className="border p-3 text-right">Quantity</th>
                  <th className="border p-3 text-right">Rate</th>
                  <th className="border p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.invoiceItems?.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border p-3">{item.description}</td>
                    <td className="border p-3">{item.hsn_code}</td>
                    <td className="border p-3 text-right">{item.quantity}</td>
                    <td className="border p-3 text-right">₹{item.rate}</td>
                    <td className="border p-3 text-right">₹{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Financial Summary</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="flex justify-between">
                  <span>Total Amount</span>
                  <span className="font-semibold">₹{invoice.total_amount}</span>
                </p>
                <p className="flex justify-between">
                  <span>SGST</span>
                  <span className="font-semibold">₹{invoice.sgst_amount}</span>
                </p>
                <p className="flex justify-between">
                  <span>CGST</span>
                  <span className="font-semibold">₹{invoice.cgst_amount}</span>
                </p>
              </div>
              <div className="border-l pl-4">
                <p className="flex justify-between text-xl font-bold">
                  <span>Grand Total</span>
                  <span className="text-green-600">₹{invoice.grand_total}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <PaymentSection />

        {/* Modal Footer */}
        <ModalFooter />
        {showPaymentModal && <PaymentModal />}
      </div>
    </div>
  );
};

export default InvoiceDetailsModal;
