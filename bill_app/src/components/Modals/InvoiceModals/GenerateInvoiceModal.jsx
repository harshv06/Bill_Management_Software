import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logoImage from "../../../assets/LetterHead.png"; // Import your logo
import Sidebar from "../../Sidebar";
import Config from "../../../utils/GlobalConfig";
import axios from "axios";
import { toast } from "react-toastify";

// const Invoices = () => {

const GenerateInvoiceModal = ({
  onClose,
  companyId, // Add companyId prop
  onInvoiceCreated, // Callback to refresh invoice list
}) => {
  const [companies, setCompanies] = useState([]);
  const [isOtherCompany, setIsOtherCompany] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([
    { description: "", hsn: "", quantity: 1, rate: "", amount: "" },
  ]);

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
      company_id: companyId || "", // Use passed companyId
      name: "",
      address: "",
      gst: "",
      stateCode: "27",
    },
  });

  const [gstRates, setGstRates] = useState({
    sgst: 2.5,
    cgst: 2.5,
    igst: 5,
    useIGST: false, // Toggle between SGST+CGST and IGST
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(
          `${Config.API_BASE_URL}/getAllCompanies`
        );
        setCompanies(response.data.companies);
      } catch (error) {
        console.error("Error fetching companies:", error);
        toast.error("Failed to fetch companies");
      }
    };

    fetchCompanies();
  }, []);

  const saveInvoiceToDB = async (products, invoiceDetails) => {
    try {
      const token = localStorage.getItem("token");
      const totalAmount = products.reduce(
        (sum, p) => sum + (parseFloat(p.amount) || 0),
        0
      );

      // Calculate GST based on selected rates
      const gstAmount = gstRates.useIGST
        ? {
            igst: totalAmount * (gstRates.igst / 100),
            sgst: 0,
            cgst: 0,
          }
        : {
            igst: 0,
            sgst: totalAmount * (gstRates.sgst / 100),
            cgst: totalAmount * (gstRates.cgst / 100),
          };

      const grandTotal =
        totalAmount +
        (gstRates.useIGST ? gstAmount.igst : gstAmount.sgst + gstAmount.cgst);

      const invoiceData = {
        invoice_number: invoiceDetails.billNumber,
        company_id: invoiceDetails.customerDetails.company_id,
        total_amount: totalAmount,
        sgst_rate: gstRates.useIGST ? 0 : gstRates.sgst,
        cgst_rate: gstRates.useIGST ? 0 : gstRates.cgst,
        igst_rate: gstRates.useIGST ? gstRates.igst : 0,
        sgst_amount: gstAmount.sgst,
        cgst_amount: gstAmount.cgst,
        igst_amount: gstAmount.igst,
        grand_total: grandTotal,
        status: "pending",
        invoice_date: new Date(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        customer_details: JSON.stringify(invoiceDetails.customerDetails),
        items: products,
      };

      const response = await axios.post(
        `${Config.API_BASE_URL}/invoices`,
        invoiceData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (onInvoiceCreated) {
        onInvoiceCreated();
      }

      toast.success("Invoice created successfully");
      onClose();
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("Failed to save invoice");
    }
  };

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

  const handleCompanyChange = (e) => {
    const selectedValue = e.target.value;

    if (selectedValue === "other") {
      setIsOtherCompany(true);
      setInvoiceDetails((prev) => ({
        ...prev,
        customerDetails: {
          company_id: null,
          name: "",
          address: "",
          gst: "",
          stateCode: "27",
        },
      }));
    } else {
      setIsOtherCompany(false);
      const selectedCompany = companies.find(
        (company) => company.company_id === parseInt(selectedValue)
      );

      if (selectedCompany) {
        setInvoiceDetails((prev) => ({
          ...prev,
          customerDetails: {
            company_id: selectedCompany.company_id,
            name: selectedCompany.company_name,
            address: selectedCompany.address,
            gst: selectedCompany.gst_number,
            stateCode: "27",
          },
        }));
      }
    }
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

  // Add this at the top of your component
  useEffect(() => {
    // Preload the letterhead image
    const img = new Image();
    img.src = logoImage;
  }, []);

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
      const totalAmount = products.reduce(
        (sum, p) => sum + (parseFloat(p.amount) || 0),
        0
      );
      const gstAmount = gstRates.useIGST
        ? {
            igst: totalAmount * (gstRates.igst / 100),
            sgst: 0,
            cgst: 0,
          }
        : {
            igst: 0,
            sgst: totalAmount * (gstRates.sgst / 100),
            cgst: totalAmount * (gstRates.cgst / 100),
          };

      const grandTotal =
        totalAmount +
        (gstRates.useIGST ? gstAmount.igst : gstAmount.sgst + gstAmount.cgst);

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

      doc.setFontSize(16);
      doc.setFont("arial", "bold");
      doc.rect(30, letterheadHeight + 20, 520, 30);
      doc.text(
        "TAX INVOICE",
        doc.internal.pageSize.width / 2,
        letterheadHeight + 40,
        {
          align: "center",
        }
      );

      doc.setFontSize(16);
      doc.setFont("arial", "bold");
      doc.rect(30, letterheadHeight + 20, 520, 30);
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
      doc.setFont("arial", "normal");

      // To Section (Customer Details)
      doc.rect(30, letterheadHeight + 50, 270, 110);
      // doc.rect(30, letterheadHeight + 40, 260, 80);
      doc.text("To:", 40, letterheadHeight + 75);
      doc.setFont("arial", "bold");
      doc.text(invoiceDetails.customerDetails.name, 40, letterheadHeight + 90);
      doc.setFont("arial", "normal");
      doc.text(
        invoiceDetails.customerDetails.address,
        40,
        letterheadHeight + 105,
        {
          maxWidth: 230,
        }
      );

      // Invoice Details Section
      doc.rect(300, letterheadHeight + 50, 250, 110);
      doc.text("From:", 310, letterheadHeight + 75);
      // doc.text("Invoice Details:", 310, letterheadHeight + 75);
      doc.setFont("arial", "bold");
      doc.text(
        `${invoiceDetails.companyDetails.name}`,
        310,
        letterheadHeight + 90
      );
      doc.setFont("arial", "normal");
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
      const tableRows = products.map((product, index) => [
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
          fontSize: 9,
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

      doc.setFontSize(10);
      // Update the tax section in PDF
      doc.text(`Total Amount: ₹${formatNumber(totalAmount)}`, 30, finalY);
      if (gstRates.useIGST) {
        doc.text(
          `IGST @${gstRates.igst}%: ₹${formatNumber(gstAmount.igst)}`,
          30,
          finalY + 20
        );
      } else {
        doc.text(
          `SGST @${gstRates.sgst}%: ₹${formatNumber(gstAmount.sgst)}`,
          30,
          finalY + 20
        );
        doc.text(
          `CGST @${gstRates.cgst}%: ₹${formatNumber(gstAmount.cgst)}`,
          30,
          finalY + 40
        );
      }

      doc.setFont("arial", "bold");
      doc.text(`Grand Total: ${formatNumber(grandTotal)}`, 30, finalY + 60);

      // // Amount in Words
      // doc.setFont("arial", "normal");
      // doc.text(`${convertToWords(Math.round(grandTotal))}`, 30, finalY + 60);

      // Additional Transaction Details
      doc.setFont("arial", "bold");
      doc.rect(30, finalY + 70, 200, 150);
      doc.text(`PAN No :-`, 35, finalY + 85);

      doc.text(`${invoiceDetails.companyDetails.pan}`, 240, finalY + 85);

      doc.text(`Provisional GST No :-`, 35, finalY + 100);

      doc.text(
        `${invoiceDetails.customerDetails.gst || "N/A"}`,
        240,
        finalY + 100
      );
      doc.text("HSN /SAC code :-", 35, finalY + 115);
      doc.text("996412", 240, finalY + 115);

      doc.text("Nature of Transaction :-", 35, finalY + 130);

      doc.text("BUSINESS TO BUSINESS", 240, finalY + 130);

      doc.text("Service Category :-", 35, finalY + 145);
      doc.text("EMPLOYEE TRANSPORTATION", 240, finalY + 145);
      doc.text("Bank Name & Branch :-", 35, finalY + 160);
      doc.text("AMANORA PUNE MH 411028", 240, finalY + 160);
      doc.text("Account No :-", 35, finalY + 175);
      doc.text("2221262245805293", 240, finalY + 175);
      doc.text("IFSC Code :-", 35, finalY + 190);
      doc.text("AUBL0002622", 240, finalY + 190);

      doc.rect(230, finalY + 70, 270, 150);

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

  const validateForm = () => {
    // Basic validation
    if (!invoiceDetails.customerDetails.company_id && !isOtherCompany) {
      toast.error("Please select a company");
      return false;
    }

    if (isOtherCompany) {
      if (!invoiceDetails.customerDetails.name) {
        toast.error("Please enter company name");
        return false;
      }
      if (!invoiceDetails.customerDetails.address) {
        toast.error("Please enter company address");
        return false;
      }
    }

    // Validate products
    const invalidProducts = products.some(
      (product) => !product.description || !product.rate || !product.quantity
    );

    if (invalidProducts) {
      toast.error("Please fill all product details");
      return false;
    }

    return true;
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto bg-white shadow-lg border rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Generate Invoice</h1>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Customer Details Input */}
            <div>
              <label className="block mb-2">Select Company</label>
              <select
                onChange={handleCompanyChange}
                className="w-full border px-2 py-1"
                defaultValue=""
              >
                <option value="" disabled>
                  Select a Company
                </option>
                {companies.map((company) => (
                  <option key={company.company_id} value={company.company_id}>
                    {company.company_name}
                  </option>
                ))}
                <option value="other">Other</option>
              </select>
            </div>

            {isOtherCompany && (
              <div>
                <label className="block mb-2">Company Name</label>
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
                  placeholder="Enter Company Name"
                />
              </div>
            )}

            {isOtherCompany && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block mb-2">Address</label>
                  <input
                    type="text"
                    value={invoiceDetails.customerDetails.address}
                    onChange={(e) =>
                      setInvoiceDetails((prev) => ({
                        ...prev,
                        customerDetails: {
                          ...prev.customerDetails,
                          address: e.target.value,
                        },
                      }))
                    }
                    className="w-full border px-2 py-1"
                    placeholder="Enter Company Address"
                  />
                </div>
                <div>
                  <label className="block mb-2">GST Number</label>
                  <input
                    type="text"
                    value={invoiceDetails.customerDetails.gst}
                    onChange={(e) =>
                      setInvoiceDetails((prev) => ({
                        ...prev,
                        customerDetails: {
                          ...prev.customerDetails,
                          gst: e.target.value,
                        },
                      }))
                    }
                    className="w-full border px-2 py-1"
                    placeholder="Enter GST Number"
                  />
                </div>
              </div>
            )}

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

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              GST Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  id="useIGST"
                  checked={gstRates.useIGST}
                  onChange={(e) =>
                    setGstRates((prev) => ({
                      ...prev,
                      useIGST: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="useIGST"
                  className="text-sm font-medium text-gray-700"
                >
                  Use IGST
                </label>
              </div>

              {!gstRates.useIGST ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SGST Rate (%)
                    </label>
                    <input
                      type="number"
                      value={gstRates.sgst}
                      onChange={(e) =>
                        setGstRates((prev) => ({
                          ...prev,
                          sgst: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      step="0.01"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CGST Rate (%)
                    </label>
                    <input
                      type="number"
                      value={gstRates.cgst}
                      onChange={(e) =>
                        setGstRates((prev) => ({
                          ...prev,
                          cgst: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      step="0.01"
                      min="0"
                      max="100"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IGST Rate (%)
                  </label>
                  <input
                    type="number"
                    value={gstRates.igst}
                    onChange={(e) =>
                      setGstRates((prev) => ({
                        ...prev,
                        igst: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    step="0.01"
                    min="0"
                    max="100"
                  />
                </div>
              )}
            </div>

            {/* GST Summary */}
            <div className="mt-4 p-3 bg-white rounded-md shadow-sm">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Tax Summary
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Total Amount:</span>
                  <span className="ml-2 font-medium">
                    ₹
                    {products
                      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
                      .toFixed(2)}
                  </span>
                </div>
                {!gstRates.useIGST ? (
                  <>
                    <div>
                      <span className="text-gray-500">SGST Amount:</span>
                      <span className="ml-2 font-medium">
                        ₹
                        {(
                          products.reduce(
                            (sum, p) => sum + (parseFloat(p.amount) || 0),
                            0
                          ) *
                          (gstRates.sgst / 100)
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">CGST Amount:</span>
                      <span className="ml-2 font-medium">
                        ₹
                        {(
                          products.reduce(
                            (sum, p) => sum + (parseFloat(p.amount) || 0),
                            0
                          ) *
                          (gstRates.cgst / 100)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div>
                    <span className="text-gray-500">IGST Amount:</span>
                    <span className="ml-2 font-medium">
                      ₹
                      {(
                        products.reduce(
                          (sum, p) => sum + (parseFloat(p.amount) || 0),
                          0
                        ) *
                        (gstRates.igst / 100)
                      ).toFixed(2)}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Grand Total:</span>
                  <span className="ml-2 font-medium text-green-600">
                    ₹
                    {(
                      products.reduce(
                        (sum, p) => sum + (parseFloat(p.amount) || 0),
                        0
                      ) *
                      (1 +
                        (gstRates.useIGST
                          ? gstRates.igst
                          : gstRates.sgst + gstRates.cgst) /
                          100)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <div>
              <button
                onClick={addProduct}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mr-4 transition-colors duration-200"
              >
                Add Product
              </button>
            </div>
            <div>
              <button
                onClick={() => {
                  if (validateForm()) {
                    generatePDF();
                  }
                }}
                disabled={!products.length || loading}
                className={`px-4 py-2 rounded transition-colors duration-200 ${
                  !products.length || loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
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
                    Generating...
                  </span>
                ) : (
                  "Generate Invoice"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateInvoiceModal;
