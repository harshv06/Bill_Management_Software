import React, { useCallback, useEffect, useState } from "react";
import { FaPlus, FaEye, FaDownload, FaFilter, FaSearch } from "react-icons/fa";
import axios from "axios";
import Sidebar from "./Sidebar";
import Config from "../utils/GlobalConfig";
import GenerateInvoiceModal from "./Modals/InvoiceModals/GenerateInvoiceModal";
import InvoiceDetailsModal from "./Modals/InvoiceModals/ViewInvoiceDetailsModal";
import { useAuth } from "@/context/authContext.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import logoImage from "../assets/letterhead Matoshree.png";
import SearchBar from "./SearchBar/InvoiceSearchBar";
import { toast } from "react-toastify";
// import { FaPlus, FaEye, FaDownload, FaFilter, FaSearch } from "react-icons/fa";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGenerateInvoiceModalOpen, setIsGenerateInvoiceModalOpen] =
    useState(false);
  const { user } = useAuth();
  // console.log(user);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isInvoiceDetailsModalOpen, setIsInvoiceDetailsModalOpen] =
    useState(false);

  // Filtering and Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (searchTerm) => {
    setIsSearching(!!searchTerm);
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    const results = filteredInvoices.filter((invoice) =>
      invoice.invoice_number.toUpperCase().includes(searchTerm)
    );
    setSearchResults(results);
  };

  const filterInvoices = useCallback((allInvoices, status) => {
    if (status === "all") return allInvoices;
    return allInvoices.filter(
      (invoice) => invoice.status.toLowerCase() === status.toLowerCase()
    );
  }, []);

  useEffect(() => {
    // Get status from URL query params
    const params = new URLSearchParams(location.search);
    const statusParam = params.get("status");
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, [location]);

  const fetchInvoices = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const response = await axios.get(`${Config.API_BASE_URL}/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: pagination.currentPage,
          limit: pagination.limit,
          status: statusFilter === "all" ? undefined : statusFilter,
        },
      });

      const { invoices, pagination: paginationData } = response.data.data;

      setInvoices(invoices);
      setPagination({
        currentPage: paginationData.currentPage,
        totalPages: paginationData.totalPages,
        totalItems: paginationData.totalItems,
        limit: paginationData.limit,
      });
    } catch (error) {
      setError("Failed to fetch invoices");
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Prevent shortcuts if modal is already open or user is typing in an input
      if (
        isGenerateInvoiceModalOpen ||
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA"
      ) {
        return;
      }

      // Ctrl + N: Open Generate Invoice Modal (with permission check)
      if (event.ctrlKey && event.key === "g") {
        event.preventDefault();
        if (user.permissions.includes("sales_invoices:create")) {
          setIsGenerateInvoiceModalOpen(true);
        } else {
          toast.error("You do not have permission to generate invoices");
        }
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGenerateInvoiceModalOpen, user]);

  useEffect(() => {
    const filtered = filterInvoices(invoices, statusFilter);
    setFilteredInvoices(filtered);
  }, [statusFilter, invoices, filterInvoices]);

  // Handle invoice update
  const handleInvoiceUpdate = useCallback((updatedInvoice) => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice) =>
        invoice.invoice_id === updatedInvoice.invoice_id
          ? { ...invoice, ...updatedInvoice }
          : invoice
      )
    );
  }, []);

  const renderInvoiceStatus = (status) => {
    const statusColors = {
      draft: "bg-yellow-100 text-yellow-800",
      sent: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
    };

    return (
      <span className={`px-2 py-1 rounded text-xs ${statusColors[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const handleViewInvoice = async (invoiceId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${Config.API_BASE_URL}/invoices/${invoiceId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(response);
      // Open a modal or navigate to invoice details page
      setSelectedInvoice(response.data.data);
      setIsInvoiceDetailsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch invoice details", error);
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    // Number formatting function
    const formatNumber = (num, digits = 2) => {
      return num.toLocaleString("en-IN", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
    };

    // Convert number to words
    const convertToWords = (num) => {
      if (num === 0) return "Zero";

      const ones = [
        "",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
      ];

      const tens = [
        "",
        "",
        "Twenty",
        "Thirty",
        "Forty",
        "Fifty",
        "Sixty",
        "Seventy",
        "Eighty",
        "Ninety",
      ];

      const convertSection = (n) => {
        if (n === 0) return "";

        if (n < 20) return ones[n] + " ";

        if (n < 100) {
          return (
            tens[Math.floor(n / 10)] +
            (n % 10 !== 0 ? " " + ones[n % 10] : "") +
            " "
          );
        }

        if (n < 1000) {
          return (
            ones[Math.floor(n / 100)] +
            " Hundred " +
            (n % 100 !== 0 ? "and " + convertSection(n % 100) : "")
          );
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

    try {
      // Fetch invoice and company data
      const token = localStorage.getItem("token");
      const [invoiceResponse, companyResponse] = await Promise.all([
        axios.get(`${Config.API_BASE_URL}/invoices/${invoiceId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        axios.get(`${Config.API_BASE_URL}/company-profile/get`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      const invoiceData = invoiceResponse.data.data;
      const companyData = companyResponse.data.data;
      console.log(companyData, invoiceData);

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
      const totalAmount = invoiceData.total_amount;
      const gstAmount = {
        igst: invoiceData.igst_amount || 0,
        sgst: invoiceData.sgst_amount || 0,
        cgst: invoiceData.cgst_amount || 0,
      };

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

      // Dynamic Customer Details - using the same renderAddressBlock function
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
        invoiceData.customer_name,
        invoiceData.invoiceCompany?.address || "N/A",
        {
          GSTIN: invoiceData.invoiceCompany?.gst_number || "N/A",
          "PAN No": invoiceData.invoiceCompany?.pan_number || "N/A",
          STATE: invoiceData.invoiceCompany?.state || "MAHARASHTRA",
          CODE: invoiceData.invoiceCompany?.state_code || "27",
        }
      );

      renderAddressBlock(
        margin + leftColumnWidth + columnSpacing,
        currentY,
        rightColumnWidth,
        "From:",
        companyData?.company_name,
        `${companyData?.address_line1}\n${companyData?.address_line2}\n${companyData?.city}, ${companyData?.state} - ${companyData?.pincode}`,
        {
          "Invoice Date": new Date(invoiceData.invoice_date).toLocaleDateString(
            "en-IN",
            {
              year: "numeric",
              month: "short",
              day: "numeric",
            }
          ),
          "Invoice No": invoiceData.invoice_number,
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
      const tableRows = invoiceData.invoiceItems.map((item, index) => [
        index + 1,
        item.description,
        item.hsn_code,
        item.quantity,
        formatNumber(parseFloat(item.rate)),
        formatNumber(parseFloat(item.amount)),
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
      const calculateGSTPercentage = (gstAmount, totalAmount) => {
        if (!totalAmount || totalAmount === 0) return 0;
        return ((gstAmount / totalAmount) * 100).toFixed(1); // Returns percentage with 1 decimal place
      };

      const financialDetails = [
        { label: "Total Amount", value: formatNumber(totalAmount) },
        ...(invoiceData.igst_amount > 0
          ? [
              {
                label: `IGST @${calculateGSTPercentage(
                  invoiceData.igst_amount,
                  invoiceData.total_amount
                )}%`,
                value: formatNumber(gstAmount.igst),
              },
            ]
          : [
              {
                label: `SGST @${calculateGSTPercentage(
                  invoiceData.sgst_amount,
                  invoiceData.total_amount
                )}%`,
                value: formatNumber(gstAmount.sgst),
              },
              {
                label: `CGST @${calculateGSTPercentage(
                  invoiceData.cgst_amount,
                  invoiceData.total_amount
                )}%`,
                value: formatNumber(gstAmount.cgst),
              },
            ]),
        {
          label: "Grand Total",
          value: formatNumber(invoiceData.grand_total),
          bold: true,
        },
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

      // Amount in words
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        `Amount in Words: ${convertToWords(
          Math.round(invoiceData.grand_total)
        )}`,
        margin + 10,
        finalY + financialDetails.length * 20 + 20
      );

      // Bottom Details Section
      const renderBottomDetailsInTwoColumns = (
        doc,
        margin,
        bottomY,
        bottomDetails
      ) => {
        // Same as your original function
        doc.rect(
          margin,
          bottomY + 100,
          doc.internal.pageSize.width - 2 * margin,
          160
        );

        const pageWidth = doc.internal.pageSize.width;
        const columnWidth = (pageWidth - 3 * margin) / 2;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        const leftColumnDetails = bottomDetails;
        const rightColumnDetails = bottomDetails;

        doc.setFont("helvetica", "bold");
        leftColumnDetails.forEach((detail, index) => {
          doc.text(
            `${detail.label} :-`,
            margin + 10,
            bottomY + 120 + index * 15
          );
        });

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

      // Bottom Details
      const bottomDetails = [
        { label: "PAN No", value: companyData?.pan_number },
        { label: "GST No", value: companyData?.gst_number },
        { label: "HSN/SAC Code", value: companyData?.hsn },
        {
          label: "Nature of Transaction",
          value: companyData?.nature_of_transaction,
        },
        { label: "Service Category", value: companyData?.service_category },
        { label: "Bank Name & Branch", value: companyData?.bank_name },
        { label: "Account No", value: companyData?.account_number },
        { label: "IFSC Code", value: companyData?.ifsc_code },
      ];

      const bottomY = finalY + 100;
      renderBottomDetailsInTwoColumns(doc, margin, bottomY, bottomDetails);

      // Save PDF
      const pdfBlob = doc.output("blob");
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Invoice_${invoiceData.invoice_number}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download invoice", error);
      toast.error("Failed to generate invoice");
    }
  };
  // const handleInvoiceUpdate = async (updatedInvoice) => {
  //   const updatedInvoices = invoices.map((invoice) =>
  //     invoice.invoice_id === updatedInvoice.invoice_id
  //       ? { ...invoice, ...updatedInvoice }
  //       : invoice
  //   );

  //   setInvoices(updatedInvoices);
  //   // Reapply current filter
  //   const filtered = filterInvoices(updatedInvoices, statusFilter);
  //   setFilteredInvoices(filtered);
  // };

  const FilterSection = () => {
    const filterButtons = [
      { status: "all", label: "All", color: "blue" },
      { status: "pending", label: "Pending", color: "yellow" },
      { status: "paid", label: "Paid", color: "green" },
      { status: "cancelled", label: "Cancelled", color: "red" },
    ];

    return (
      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-2">
          {filterButtons.map(({ status, label, color }) => (
            <button
              key={status}
              className={`px-4 py-2 rounded-lg ${
                statusFilter === status
                  ? `bg-${color}-500 text-white`
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => handleFilterChange(status)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleFilterChange = useCallback(
    (status) => {
      setStatusFilter(status);
      navigate(`/invoices${status === "all" ? "" : `?status=${status}`}`);
    },
    [navigate]
  );

  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  }, []);

  const PaginationControls = () => {
    const { currentPage, totalPages, totalItems, limit } = pagination;

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-between items-center mt-4 mb-4 px-4">
        <div className="text-sm text-gray-600">
          Showing {(currentPage - 1) * limit + 1} to{" "}
          {Math.min(currentPage * limit, totalItems)} of {totalItems} entries
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`px-3 py-1 border rounded ${
                currentPage === number
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              {number}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Invoices{" "}
            <span className="text-xs text-gray-500 ml-2">
              (Ctrl+G: Generate Invoice)
            </span>
          </h1>
          {user.permissions.includes("sales_invoices:create") && (
            <button
              onClick={() => setIsGenerateInvoiceModalOpen(true)}
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
            >
              <FaPlus className="mr-2" />
              Generate Invoice
            </button>
          )}
        </div>
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} />
        </div>
        <FilterSection />
        <PaginationControls />
        {/* Invoices Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {isSearching && searchResults.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No invoices found matching your search
            </div>
          ) : !isSearching && filteredInvoices.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No invoices found
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bill Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(isSearching ? searchResults : filteredInvoices).map(
                  (invoice) => (
                    <tr
                      key={invoice.invoice_id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {invoice.customer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold">
                        ₹{invoice.grand_total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderInvoiceStatus(invoice.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleViewInvoice(invoice.invoice_id)
                            }
                            className="text-blue-500 hover:text-blue-700 transition flex items-center"
                            title="View Invoice"
                          >
                            <FaEye className="mr-1" /> View
                          </button>
                          <button
                            onClick={() =>
                              handleDownloadInvoice(invoice.invoice_id)
                            }
                            className="text-green-500 hover:text-green-700 transition flex items-center"
                            title="Download Invoice"
                          >
                            <FaDownload className="mr-1" /> Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>

        {isInvoiceDetailsModalOpen && selectedInvoice && (
          <InvoiceDetailsModal
            isOpen={isInvoiceDetailsModalOpen}
            onClose={() => setIsInvoiceDetailsModalOpen(false)}
            invoice={selectedInvoice}
            onDownload={() => handleDownloadInvoice(selectedInvoice.invoice_id)}
            onUpdate={handleInvoiceUpdate}
          />
        )}

        {/* Invoice Generation Modal */}
        {isGenerateInvoiceModalOpen && (
          <GenerateInvoiceModal
            onClose={() => setIsGenerateInvoiceModalOpen(false)}
            onInvoiceCreated={() => {
              // Refresh invoices after creating a new one
              const fetchInvoices = async () => {
                const token = localStorage.getItem("token");
                try {
                  const response = await axios.get(
                    `${Config.API_BASE_URL}/invoices`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );
                  const allInvoices = response.data.data.invoices || [];
                  setInvoices(allInvoices);

                  // Apply current filter
                  const filtered = filterInvoices(allInvoices, statusFilter);
                  setFilteredInvoices(filtered);
                } catch (error) {
                  console.error("Failed to refresh invoices", error);
                }
              };

              fetchInvoices();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Invoices;
