import React, { useEffect, useState, useMemo } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logoImage from "../../../assets/letterhead Matoshree.png"; // Import your logo
import Config from "../../../utils/GlobalConfig";
import axios from "axios";
import { toast } from "react-toastify";
import AddCompanyModal from "../AddCompanyModal";
import CompanySearch from "../Company/CompanySearch";

// const Invoices = () => {

const GenerateInvoiceModal = ({
  onClose,
  companyId, // Add companyId prop
  onInvoiceCreated, // Callback to refresh invoice list
}) => {
  const [companies, setCompanies] = useState([]);
  const [isOtherCompany, setIsOtherCompany] = useState(false);
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);
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
          `${Config.API_BASE_URL}/getAllCompaniesWithoutPagination`
        );
        console.log(response);
        setCompanies(response.data.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
        toast.error("Failed to fetch companies");
      }
    };

    fetchCompanies();
  }, [isAddCompanyModalOpen]); // Refetch companies when modal closes

  const handleAddCompany = async (companyData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${Config.API_BASE_URL}/addCompany`,
        companyData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        toast.success("Company added successfully");

        // Close the add company modal
        setIsAddCompanyModalOpen(false);

        // Immediately update the companies list
        setCompanies((prevCompanies) => [...prevCompanies, response.data.data]);

        // Automatically select the newly added company
        const newCompany = response.data.data;
        setInvoiceDetails((prev) => ({
          ...prev,
          customerDetails: {
            company_id: newCompany.company_id,
            name: newCompany.company_name,
            address: newCompany.address,
            gst: newCompany.gst_number,
            stateCode: "27",
          },
        }));

        // Reset other company state
        setIsOtherCompany(false);
      } else {
        toast.error(response.data.message || "Failed to add company");
      }
    } catch (error) {
      console.error("Error adding company:", error);
      toast.error("Failed to add company");
    }
  };

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

      console.log(invoiceData);

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

      const DayBookData = {
        account_head: "Income",
        amount: response.data.data.invoice.grand_total,
        bank_account_id: null,
        bank_name: null,
        bank_account_number: null,
        bank_ifsc_code: null,
        car_id: null,
        category: "PAYMENTS",
        company_id: response.data.data.invoice.company_id,
        description: `Invoice created for ${response.data.data.invoice.customer_name}`,
        gst_applicable:
          response.data.data.invoice.sgst_amount > 0 ? true : false,
        party_name: response.data.data.invoice.customer_name,
        party_type: "Customer",
        payment_method: "cash",
        reference_number: response.data.data.invoice.invoice_number,
        sub_group: "INVOICE",
        transaction_date: new Date(),
        transaction_type: "CREDIT",
        voucher_type: "Sales",
      };

      console.log("Invoice created:", DayBookData);

      const daybookResponse = await axios.post(
        `${Config.API_BASE_URL}/daybook/transactions`,
        DayBookData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(daybookResponse);

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
    // Number formatting function
    const formatNumber = (num, digits = 2) => {
      return num.toLocaleString("en-IN", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
    };

    const convertToWords = (num) => {
      if (num === 0) return "Zero";
    
      const ones = [
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", 
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", 
        "Sixteen", "Seventeen", "Eighteen", "Nineteen"
      ];
      
      const tens = [
        "", "", "Twenty", "Thirty", "Forty", "Fifty", 
        "Sixty", "Seventy", "Eighty", "Ninety"
      ];
    
      const convertSection = (n) => {
        if (n === 0) return "";
        
        if (n < 20) return ones[n] + " ";
        
        if (n < 100) {
          return tens[Math.floor(n / 10)] + 
                 (n % 10 !== 0 ? " " + ones[n % 10] : "") + " ";
        }
        
        if (n < 1000) {
          return ones[Math.floor(n / 100)] + " Hundred " + 
                 (n % 100 !== 0 ? "and " + convertSection(n % 100) : "");
        }
        
        return "";
      };
    
      const crore = Math.floor(num / 10000000);
      const lakh = Math.floor((num % 10000000) / 100000);
      const thousand = Math.floor((num % 100000) / 1000);
      const remainder = num % 1000;
    
      let result = "";
    
      if (crore > 0) {
        result += convertSection(crore) + "Crore ";
      }
    
      if (lakh > 0) {
        result += convertSection(lakh) + "Lakh ";
      }
    
      if (thousand > 0) {
        result += convertSection(thousand) + "Thousand ";
      }
    
      if (remainder > 0) {
        result += convertSection(remainder);
      }
    
      return result.trim() + " Rupees Only";
    };
    console.log(invoiceDetails)
    try {
      setLoading(true);
      setError(null);

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 30;
      const columnSpacing = 20;

      // Calculate column widths
      const leftColumnWidth = (pageWidth - 3 * margin) / 2;
      const rightColumnWidth = (pageWidth - 3 * margin) / 2;

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

      // Letterhead Image
      const letterheadImage = new Image();
      await new Promise((resolve, reject) => {
        letterheadImage.onload = () => {
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

      const letterheadHeight = 175 * (pageWidth / 991);
      let currentY = letterheadHeight + 50;

      // Tax Invoice Title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("TAX INVOICE", pageWidth / 2, currentY - 10, {
        align: "center",
      });

      // Billing Details Section
      doc.setFontSize(10);

      // Dynamic Customer Details
      const renderAddressBlock = (
        x,
        y,
        width,
        title,
        name,
        address,
        additionalDetails = {}
      ) => {
        // Box
        doc.rect(x, y, width, 130);

        // Title
        doc.setFont("helvetica", "normal");
        doc.text(title, x + 10, y + 25);

        // Name and Address
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        const nameLines = doc.splitTextToSize(name, width - 20);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        const addressLines = doc.splitTextToSize(address, width - 20);

        let lineY = y + 40;
        nameLines.forEach((line) => {
          doc.text(line, x + 10, lineY);
          lineY += 15;
        });

        addressLines.forEach((line) => {
          doc.text(line, x + 10, lineY);
          lineY += 12;
        });

        // Additional Details
        if (Object.keys(additionalDetails).length) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          let detailY = y + 130 + 15;
          Object.entries(additionalDetails).forEach(([key, value]) => {
            doc.text(`${key}: ${value}`, x + 10, detailY);
            detailY += 15;
          });
        }
      };

      // Render Customer and Company Blocks
      renderAddressBlock(
        margin,
        currentY,
        leftColumnWidth,
        "To:",
        invoiceDetails.customerDetails.name,
        invoiceDetails.customerDetails.address,
        {
          "GST No": invoiceDetails.customerDetails.gst || "N/A",
          "PAN No": invoiceDetails.customerDetails.pan || "N/A",
          "State Code": invoiceDetails.companyDetails.stateCode || "27",
        }
      );

      renderAddressBlock(
        margin + leftColumnWidth + columnSpacing,
        currentY,
        rightColumnWidth,
        "From:",
        invoiceDetails.companyDetails.name,
        invoiceDetails.companyDetails.address,
        {
          "Invoice Date": invoiceDetails.companyDetails.date || "N/A",
          "Invoice No": invoiceDetails.billNumber,
        }
      );

      // Move to next section
      currentY += 180;

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
        startY: currentY + 10,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 5,
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 12,
        },
      });

      // Financial Summary
      const finalY = doc.previousAutoTable.finalY + 20;
      const financialDetails = [
        { label: "Total Amount", value: formatNumber(totalAmount) },
        ...(gstRates.useIGST
          ? [
              {
                label: `IGST @${gstRates.igst}%`,
                value: formatNumber(gstAmount.igst),
              },
            ]
          : [
              {
                label: `SGST @${gstRates.sgst}%`,
                value: formatNumber(gstAmount.sgst),
              },
              {
                label: `CGST @${gstRates.cgst}%`,
                value: formatNumber(gstAmount.cgst),
              },
            ]),
        { label: "Grand Total", value: formatNumber(grandTotal), bold: true },
      ];

      // Render Financial Summary
      financialDetails.forEach((detail, index) => {
        doc.setFont(detail.bold ? "helvetica-bold" : "helvetica", "normal");
        doc.setFontSize(detail.bold ? 14 : 12);
        doc.text(
          `${detail.label}: ${detail.value}`,
          margin + 10,
          finalY + index * 20
        );
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        `Amount in Words: ${convertToWords(Math.round(grandTotal))}`,
        margin + 10,
        finalY + financialDetails.length * 20 + 20
      );

      const renderBottomDetailsInTwoColumns = (
        doc,
        margin,
        bottomY,
        bottomDetails
      ) => {
        // Draw main rectangle
        doc.rect(
          margin,
          bottomY + 100,
          doc.internal.pageSize.width - 2 * margin,
          160
        );

        // Calculate column widths
        const pageWidth = doc.internal.pageSize.width;
        const columnWidth = (pageWidth - 3 * margin) / 2;

        // Set font
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        // Split details into two columns
        const leftColumnDetails = bottomDetails;
        const rightColumnDetails = bottomDetails;

        // Render Left Column - Labels
        doc.setFont("helvetica", "bold");
        leftColumnDetails.forEach((detail, index) => {
          doc.text(
            `${detail.label} :-`,
            margin + 10,
            bottomY + 120 + index * 15
          );
        });

        // Render Right Column - Labels
        doc.setFont("helvetica", "bold");
        rightColumnDetails.forEach((detail, index) => {
          doc.text(
            `${detail.value}`,
            margin + columnWidth + 20,
            bottomY + 120 + index * 15
          );
        });

        doc.setDrawColor(200, 200, 200);
        doc.line(
          margin + columnWidth + 10,
          bottomY + 100,
          margin + columnWidth + 10,
          bottomY + 260
        );
      };

      // Bottom Details Section
      const bottomDetails = [
        { label: "PAN No", value: invoiceDetails.companyDetails.pan },
        {
          label: "Provisional GST No",
          value: "27AAQCM3825L1ZW",
        },
        { label: "HSN/SAC Code", value: "996412" },
        { label: "Nature of Transaction", value: "BUSINESS TO BUSINESS" },
        { label: "Service Category", value: "EMPLOYEE TRANSPORTATION" },
        { label: "Bank Name & Branch", value: "AMANORA PUNE MH 411028" },
        { label: "Account No", value: "2221262245805293" },
        { label: "IFSC Code", value: "AUBL0002622" },
      ];

      // Render Bottom Details
      // const bottomY = finalY + 100;
      const bottomY = finalY + 100;
      renderBottomDetailsInTwoColumns(doc, margin, bottomY, bottomDetails);

      // Save PDF
      doc.save(`invoice_${invoiceDetails.billNumber}.pdf`);
      saveInvoiceToDB(products, invoiceDetails);
      onClose();
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setLoading(false);
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

  const handleCompanySelect = (selectedCompany) => {
    setInvoiceDetails((prev) => ({
      ...prev,
      customerDetails: {
        company_id: selectedCompany.company_id,
        name: selectedCompany.company_name,
        address: selectedCompany.address,
        gst: selectedCompany.gst_number,
        pan: selectedCompany.pan_number,
        stateCode: "27",
      },
    }));
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}

      {/* Main Content Area */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose} // Close modal when clicking outside
      >
        <div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-2xl p-6"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h1 className="text-2xl font-bold mb-6">Generate Invoice</h1>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Select Company
              </label>

              <CompanySearch
                companies={companies}
                onSelectCompany={handleCompanySelect}
                onAddNewCompany={() => {
                  setIsOtherCompany(true);
                  setIsAddCompanyModalOpen(true);
                }}
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
      {isAddCompanyModalOpen && (
        <AddCompanyModal
          isOpen={isAddCompanyModalOpen}
          onClose={() => {
            setIsAddCompanyModalOpen(false);
            setIsOtherCompany(false);
          }}
          onAdd={handleAddCompany}
        />
      )}
    </div>
  );
};

export default GenerateInvoiceModal;
