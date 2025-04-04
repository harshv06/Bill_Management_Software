import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../../utils/GlobalConfig";
import Sidebar from "../../Sidebar";
import { toast } from "react-hot-toast";
import Select from "react-select";

const NewPurchaseInvoice = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [customNumber, setCustomNumber] = useState("");
  const [formData, setFormData] = useState({
    vendor: null,
    invoice_date: new Date().toISOString().split("T")[0],
    invoice_number: "",
    items: [
      {
        description: "",
        quantity: 1,
        rate: 0,
        gst_rate: null,
        gst_amount: 0,
        amount: 0,
        custom_gst_input: "", // Add this field
      },
    ],
    subtotal: 0,
    total_gst: 0,
    total_amount: 0,
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [customGstRate, setCustomGstRate] = useState("");
  // Fetch vendors on component mount
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${config.API_BASE_URL}/getAllCompaniesWithoutPagination`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log(response);

        // Transform vendor data for react-select
        const vendorOptions = response.data.data.map((vendor) => ({
          value: vendor.vendor_id,
          label: `${vendor.company_name}`,
          gst_number: vendor.gst_number,
          address: vendor.address,
        }));

        setVendors(vendorOptions);
      } catch (error) {
        toast.error("Failed to fetch vendors");
      }
    };

    fetchVendors();
    generateInvoiceNumber(customNumber); // Pass customNumber here
  }, [customNumber]);

  // Add this near the top of your component, after the state declarations

  const generateInvoiceNumber = (customNum = "") => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");

    let numberPart;
    if (customNum) {
      numberPart = customNum;
    } else {
      const currentCounter =
        localStorage.getItem("purchaseInvoiceCounter") || "0";
      numberPart = (parseInt(currentCounter) + 1).toString().padStart(4, "0");
      localStorage.setItem("purchaseInvoiceCounter", numberPart);
    }

    const invoiceNumber = `PI-${year}${month}-${numberPart}`;
    setFormData((prev) => ({ ...prev, invoice_number: invoiceNumber }));
  };

  const handleVendorChange = (selectedVendor) => {
    setFormData((prev) => ({
      ...prev,
      vendor: selectedVendor,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];

    // If vendor has no GST number, force GST rate to 0
    if (!formData.vendor?.gst_number) {
      newItems[index] = {
        ...newItems[index],
        gst_rate: 0,
        gst_amount: 0,
        [field]: value,
      };
    } else {
      // Existing GST handling logic
      if (field === "gst_rate") {
        if (value === "custom") {
          newItems[index] = {
            ...newItems[index],
            gst_rate: null,
            custom_gst_input: "",
          };
        } else {
          newItems[index] = {
            ...newItems[index],
            gst_rate: parseFloat(value),
            custom_gst_input: "",
          };
        }
      } else if (field === "custom_gst_input") {
        const customRate = parseFloat(value);
        newItems[index] = {
          ...newItems[index],
          gst_rate: isNaN(customRate) ? null : customRate,
          custom_gst_input: value,
        };
      } else {
        newItems[index] = {
          ...newItems[index],
          [field]: value,
        };
      }
    }

    // Rest of the calculation logic remains the same
    const updatedItems = newItems.map((item) => {
      const baseAmount = item.quantity * item.rate;
      const gstRate = item.gst_rate || 0;
      const gstAmount = (baseAmount * gstRate) / 100;

      return {
        ...item,
        amount: baseAmount,
        gst_amount: gstAmount,
      };
    });

    // Calculate totals
    const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    const total_gst = updatedItems.reduce(
      (sum, item) => sum + item.gst_amount,
      0
    );
    const total_amount = subtotal + total_gst;

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
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
          gst_rate: null,
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

  const handleSubmit = useCallback(
    async (e) => {
      if (e) {
        e.preventDefault();
      }

      // Validation
      if (!formData.vendor) {
        toast.error("Please select a vendor");
        return;
      }

      if (formData.items.length === 0) {
        toast.error("Please add at least one item");
        return;
      }

      setLoading(true);

      try {
        const token = localStorage.getItem("token");
        const submitData = {
          ...formData,
          vendor_id: formData.vendor.value,
          vendor_name: formData.vendor.label,
          vendor_gst: formData.vendor.gst_number,
        };

        console.log("Submit Data:", formData);
        const response = await axios.post(
          `${config.API_BASE_URL}/createPurchaseInvocie`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const DayBookData = {
          account_head: "Expenses",
          amount: response.data.data.total_amount,
          bank_account_id: null,
          bank_name: null,
          bank_account_number: null,
          bank_ifsc_code: null,
          car_id: null,
          category: "DIRECT",
          company_id: response.data.data.vendor_id,
          description: `Purchase invoice for ${response.data.data.vendor_name} `,
          gst_applicable: response.data.data.total_gst > 0 ? true : false,
          party_name: response.data.data.vendor_name,
          party_type: "Vendor",
          payment_method: "cash",
          reference_number: response.data.data.invoice_number,
          sub_group: "PURCHASE",
          transaction_date: new Date(),
          transaction_type: "DEBIT",
          voucher_type: "Purchase",
        };

        await axios.post(
          `${config.API_BASE_URL}/daybook/transactions`,
          DayBookData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log(response);
        toast.success("Purchase Invoice created successfully");
        navigate("/purchase-invoices");
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to create purchase invoice"
        );
      } finally {
        setLoading(false);
      }
    },
    [formData, navigate]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault(); // Prevent browser's save dialog
        console.log(e.key);
        handleSubmit(e);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSubmit]); // Add handleSubmit to dependency array

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        {/* // Change this div's class */}
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8">
          {" "}
          {/* Changed from max-w-4xl to max-w-7xl */}
          <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
            Create New Purchase Invoice
          </h1>
          <form onSubmit={handleSubmit}>
            {/* Header Section */}
            <div className="grid md:grid-cols-3 gap-8 mb-6 background-black-50 p-4 rounded-lg">
              {" "}
              {/* Changed gap-6 to gap-8 */}
              <div className="bg-white">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor *
                </label>
                <Select
                  options={vendors}
                  value={formData.vendor}
                  onChange={handleVendorChange}
                  placeholder="Select Vendor"
                  className="w-full"
                  required
                  formatOptionLabel={({ label, gst_number }) => (
                    <div>
                      <div>{label}</div>
                      {gst_number && (
                        <div className="text-xs text-gray-500">
                          GST: {gst_number}
                        </div>
                      )}
                    </div>
                  )}
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: "white",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? "#f3f4f6" : "white",
                      color: "black",
                      "&:hover": {
                        backgroundColor: "#f3f4f6",
                      },
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: "white",
                    }),
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Number
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.invoice_number}
                    className="w-2/3 px-3 py-2 bg-gray-100 border rounded-md"
                    readOnly
                  />
                  <div className="relative w-1/3">
                    <input
                      type="text"
                      placeholder="Custom Number"
                      value={customNumber}
                      onChange={(e) => {
                        setCustomNumber(e.target.value);
                        generateInvoiceNumber(e.target.value);
                      }}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                    {customNumber && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomNumber("");
                          generateInvoiceNumber();
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Format: PI-YYYYMM-{customNumber || "XXXX"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Date *
                </label>
                <input
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      invoice_date: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
            </div>

            {/* Items Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Invoice Items
                </h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                >
                  Add Item
                </button>
              </div>

              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-7 gap-4 mb-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                      placeholder="Item description"
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-gray-600 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          parseInt(e.target.value)
                        )
                      }
                      min="1"
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-gray-600 mb-1">
                      Rate (₹) *
                    </label>
                    <input
                      type="number"
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
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">
                      GST Rate {formData.vendor?.gst_number && "*"}
                    </label>
                    {formData.vendor?.gst_number ? (
                      <div className="flex flex-col">
                        <select
                          value={
                            item.gst_rate === null
                              ? item.custom_gst_input
                                ? "custom"
                                : ""
                              : [0, 5, 12, 18, 28].includes(item.gst_rate)
                              ? item.gst_rate
                              : "custom"
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            handleItemChange(index, "gst_rate", value);

                            if (value !== "custom") {
                              const updatedItems = [...formData.items];
                              updatedItems[index] = {
                                ...updatedItems[index],
                                custom_gst_input: "",
                              };
                              setFormData((prev) => ({
                                ...prev,
                                items: updatedItems,
                              }));
                            }
                          }}
                          className="w-full px-3 py-2 border rounded-md"
                          required
                        >
                          <option value="">Select GST</option>
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                          <option value="custom">Custom GST</option>
                        </select>

                        {(item.gst_rate === null ||
                          (item.gst_rate !== null &&
                            ![0, 5, 12, 18, 28].includes(item.gst_rate))) && (
                          <input
                            type="number"
                            value={item.custom_gst_input}
                            onChange={(e) => {
                              const value = e.target.value;
                              handleItemChange(
                                index,
                                "custom_gst_input",
                                value
                              );
                            }}
                            placeholder="Enter Custom GST %"
                            className="w-full px-3 py-2 border rounded-md mt-2"
                            min="0"
                            step="0.01"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 py-2">
                        GST not applicable
                      </div>
                    )}
                  </div>
                  <div className="col-span-1 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">
                        ₹{item.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        GST: ₹{item.gst_amount.toFixed(2)}
                      </div>
                    </div>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals and Notes */}
            <div className="grid md:grid-cols-2 gap-8 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows="4"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Optional notes for this invoice"
                />
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">
                    ₹{formData.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Total GST:</span>
                  <span className="font-semibold">
                    ₹{formData.total_gst.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Grand Total:</span>
                  <span>₹{formData.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate("/purchase-invoices")}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Invoice (Ctrl+S)"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewPurchaseInvoice;
