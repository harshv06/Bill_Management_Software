// utils/pdfGenerator.js
import jsPDF from "jspdf";
import "jspdf-autotable";

export const generatePurchaseInvoicePDF = (invoice) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Add company logo and header
  doc.setFontSize(20);
  doc.text("Purchase Invoice", pageWidth / 2, 20, { align: "center" });

  // Add invoice details
  doc.setFontSize(12);
  doc.text(`Invoice Number: ${invoice.invoice_number}`, 15, 40);
  doc.text(
    `Date: ${new Date(invoice.invoice_date).toLocaleDateString()}`,
    15,
    50
  );
  doc.text(`Vendor: ${invoice.vendor_name}`, 15, 60);

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

  const tableRows = invoice.items.map((item) => [
    item.description,
    item.quantity,
    `₹${Number(item.rate).toFixed(2)}`,
    `${item.gst_rate}%`,
    `₹${Number(item.amount).toFixed(2)}`,
    `₹${Number(item.gst_amount).toFixed(2)}`,
    `₹${Number(invoice.total_amount).toFixed(2)}`,
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
        `₹${Number(invoice.subtotal).toFixed(2)}`,
        `₹${Number(invoice.total_gst).toFixed(2)}`,
        `₹${Number(invoice.total_amount).toFixed(2)}`,
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
  doc.save(`Purchase_Invoice_${invoice.invoice_number}.pdf`);
};
