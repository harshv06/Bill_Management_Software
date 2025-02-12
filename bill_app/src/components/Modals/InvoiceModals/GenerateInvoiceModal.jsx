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
      company_id: companyId || "", // Use passed companyId
      name: "",
      address: "",
      gst: "",
      stateCode: "27",
    },
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
      // Calculate totals
      const totalAmount = products.reduce(
        (sum, p) => sum + (parseFloat(p.amount) || 0),
        0
      );
      const sgstRate = 0.025;
      const cgstRate = 0.025;
      const sgst = Number((totalAmount * sgstRate).toFixed(2));
      const cgst = Number((totalAmount * cgstRate).toFixed(2));
      const grandTotal = Number((totalAmount + sgst + cgst).toFixed(2));

      // Prepare invoice data
      const invoiceData = {
        invoice_number: invoiceDetails.billNumber,
        company_id: invoiceDetails.customerDetails.company_id,
        total_amount: totalAmount,
        sgst_amount: sgst,
        cgst_amount: cgst,
        grand_total: grandTotal,
        status: "pending",
        invoice_date: new Date(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        // customer_details: JSON.stringify(invoiceDetails.customerDetails),
        customer_details: JSON.stringify(invoiceDetails.customerDetails),
        items: products,
      };

      // Send to backend
      const response = await axios.post(
        `${Config.API_BASE_URL}/invoices`,
        invoiceData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add token to headers
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Invoice saved:", response);
      // Notify parent component
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

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    // A4 dimensions in points
    const pageWidth = 595.28;
    const pageHeight = 841.89;

    // Load letterhead image
    const letterheadImage = new Image();
    letterheadImage.src = logoImage;

    letterheadImage.onload = () => {
      // Add letterhead image at the top of the page
      doc.addImage(
        letterheadImage,
        "PNG",
        0, // x-coordinate
        0, // y-coordinate
        pageWidth, // width (full page width)
        175 * (pageWidth / 991) // height (maintain aspect ratio)
      );

      // Adjust startY to account for letterhead height
      const letterheadHeight = 175 * (pageWidth / 991);

      // Calculate totals with improved precision
      const totalAmount = products.reduce(
        (sum, p) => sum + (parseFloat(p.amount) || 0),
        0
      );
      const sgstRate = 0.025;
      const cgstRate = 0.025;
      const sgst = Number((totalAmount * sgstRate).toFixed(2));
      const cgst = Number((totalAmount * cgstRate).toFixed(2));
      const grandTotal = Number((totalAmount + sgst + cgst).toFixed(2));

      // Number formatting function with Indian number formatting
      const formatNumber = (num, digits = 2) => {
        return num.toLocaleString("en-IN", {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        });
      };

      // Convert number to words for grand total
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

      // Invoice Title
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
      doc.rect(30, letterheadHeight + 50, 270, 70);
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
      doc.rect(300, letterheadHeight + 50, 250, 70);
      doc.text("From:", 310, letterheadHeight + 75);
      // doc.text("Invoice Details:", 310, letterheadHeight + 75);
      doc.text(
        `Bill No: ${invoiceDetails.companyDetails.name}`,
        310,
        letterheadHeight + 90
      );
      doc.text(
        `Bill Date: ${invoiceDetails.companyDetails.address}`,
        310,
        letterheadHeight + 105
      );

      // Additional Details
      doc.text(
        `GST No: ${invoiceDetails.customerDetails.gst || "N/A"}`,
        30,
        letterheadHeight + 140
      );
      doc.text(
        `PAN No: ${invoiceDetails.companyDetails.pan}`,
        300,
        letterheadHeight + 140
      );
      doc.text(
        `State Code: ${invoiceDetails.companyDetails.stateCode}`,
        500,
        letterheadHeight + 140
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
        startY: letterheadHeight + 160,
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
          5: { width: 70 },
        },
      });

      // Financial Summary
      const finalY = doc.previousAutoTable.finalY + 20;

      doc.setFontSize(10);
      doc.text(`Total Amount: ₹${formatNumber(totalAmount)}`, 30, finalY);
      doc.text(
        `SGST @${sgstRate * 100}%: ₹${formatNumber(sgst)}`,
        30,
        finalY + 15
      );
      doc.text(
        `CGST @${cgstRate * 100}%: ₹${formatNumber(cgst)}`,
        30,
        finalY + 30
      );

      doc.setFont("arial", "bold");
      doc.text(`Grand Total: ₹${formatNumber(grandTotal)}`, 30, finalY + 45);

      // Amount in Words
      doc.setFont("arial", "normal");
      doc.text(`${convertToWords(Math.round(grandTotal))}`, 30, finalY + 60);

      // Additional Transaction Details
      doc.setFont("arial", "normal");
      doc.text(
        `PAN No :- ${invoiceDetails.companyDetails.pan}`,
        30,
        finalY + 85
      );
      doc.text(
        `Provisional GST No :- ${invoiceDetails.companyDetails.gst}`,
        30,
        finalY + 100
      );
      doc.text("HSN /SAC code :- 996412", 30, finalY + 115);
      doc.text(
        "Nature of Transaction :- BUSINESS TO BUSINESS",
        30,
        finalY + 130
      );
      doc.text("Service Category :- EMPLOYEE TRANSPORTATION", 30, finalY + 145);
      doc.text(
        "Bank Name & Branch :- AMANORA PUNE MH 411028",
        30,
        finalY + 160
      );
      doc.text("Account No :- 2221262245805293", 30, finalY + 175);
      doc.text("IFSC Code :- AUBL0002622", 30, finalY + 190);

      // Save the PDF
      doc.save(`invoice_${invoiceDetails.billNumber}.pdf`);
      // addDataToDB(products, invoiceDetails);
      saveInvoiceToDB(products, invoiceDetails);
      onClose();
    };

    // Trigger image loading
    letterheadImage.src = logoImage;
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

export default GenerateInvoiceModal;
