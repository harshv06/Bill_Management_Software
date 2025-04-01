// components/DayBook/AddTransactionModal.js
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import Config from "../../utils/GlobalConfig";
import AddCompanyModal from "../Modals/AddCompanyModal";
import BankAccountService from "../../utils/BankAccountService";
import { toast } from "react-hot-toast";
import SearchableInput from "../SearchableInput";
const AddTransactionModal = ({
  onClose,
  onSubmit,
  initialData = null,
  mode = "add",
}) => {
  // console.log(initialData)
  const [formData, setFormData] = useState(
    initialData
      ? {
          ...initialData,
          transaction_date: initialData.transaction_date
            ? new Date(initialData.transaction_date)
            : new Date(),
          amount: initialData.amount || "",
          account_head: initialData.bank_account_id
            ? "Expenses"
            : initialData.account_head,
          bank_account_id: initialData.bank_account_id || "",
          sub_group: initialData.sub_group || "",
          party_type: initialData.party_type || "",
          company_id: initialData.company_id || "",
          car_id: initialData.car_id || "",
        }
      : {
          transaction_date: new Date(),
          description: "",
          transaction_type: "CREDIT",
          amount: "",
          reference_number: "",
          category: "",
          payment_method: "",
          account_head: "",
          sub_account: "",
          voucher_type: "",
          voucher_number: "",
          gst_applicable: false,
          gst_amount: "",
          gst_rate: "",
          narration: "",
          party_name: "",
          party_type: "",
          company_id: "",
          car_id: "",
          sub_group: "",
        }
  );

  const accountHeads = [
    "Assets",
    "Liabilities",
    "Income",
    "Expenses",
    "Capital",
  ];

  const subAccounts = {
    Assets: [
      "Cash",
      "Bank",
      "Accounts Receivable",
      "Fixed Assets",
      "Inventory",
    ],
    Liabilities: ["Accounts Payable", "Loans", "Tax Payable"],
    Income: ["Sales", "Service Revenue", "Interest Income"],
    Expenses: ["Purchase", "Salary", "Rent", "Utilities", "Office Expenses"],
    Capital: ["Owner's Capital", "Drawings"],
  };

  const voucherTypes = [
    "Payment",
    "Receipt",
    "Contra",
    "Journal",
    "Sales",
    "Purchase",
  ];

  const partyTypes = ["Customer", "Vendor", "Employee", "Other"];
  const [errors, setErrors] = useState({});

  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [companies, setCompanies] = useState([]);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [cars, setCars] = useState([]);
  const [isLoadingCars, setIsLoadingCars] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState(null);
  const [subGroups, setSubGroups] = useState([]);
  const [showAddSubGroup, setShowAddSubGroup] = useState(false);
  const [newSubGroup, setNewSubGroup] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newSubGroupName, setNewSubGroupName] = useState("");
  const [showShortcutMenu, setShowShortcutMenu] = useState(false);

  const paymentMethods = [
    "cash",
    "bank_transfer",
    "cheque",
    "upi",
    "card",
    "other",
  ];

  const PREDEFINED_GROUPS = [
    "Salary",
    "Rent",
    "Utilities",
    "Office Expenses",
    "Travel",
    "Maintenance",
    "Supplies",
    "Marketing",
    "Legal",
    "Consulting",
    "Insurance",
    "Training",
    "Communication",
    "Transportation",
    "Meals & Entertainment",
    "Printing & Stationery",
    "Software & Subscriptions",
    "Repairs & Maintenance",
    "Professional Fees",
    "Miscellaneous",
  ];

  const resetForm = () => {
    setFormData(
      mode === "edit" && initialData
        ? {
            ...initialData,
            transaction_date: initialData.transaction_date
              ? new Date(initialData.transaction_date)
              : new Date(),
          }
        : {
            transaction_date: new Date(),
            description: "",
            transaction_type: "CREDIT",
            amount: "",
            category: "",
            payment_method: "",
            account_head: "",
            sub_account: "",
            voucher_type: "",
            narration: "",
            party_name: "",
            party_type: "",
            company_id: "",
            car_id: "",
          }
    );

    // Reset other states if needed
    setSelectedBankAccount(null);
    setSelectedCategory(null);
  };

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(
        `${Config.API_BASE_URL}/daybook/FetchCategories`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    }
  }, []);

  const fetchCars = useCallback(async () => {
    setIsLoadingCars(true);
    try {
      const response = await axios.get(`${Config.API_BASE_URL}/cars`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const carData =
        response.data.data?.cars || response.data.cars || response.data;

      if (Array.isArray(carData)) {
        setCars(carData);
      } else {
        console.error("Invalid car data format", carData);
        setCars([]);
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
      setCars([]);
    } finally {
      setIsLoadingCars(false);
    }
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(
        `${Config.API_BASE_URL}/getAllCompaniesWithoutPagination`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log(response.data.companies);
      setCompanies(response.data.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const fetchSubGroups = async (categoryId) => {
    try {
      const response = await axios.get(
        `${Config.API_BASE_URL}/daybook/fetchSubGroups/${categoryId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Ensure data is an array, default to empty array if undefined
      const subGroupData = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      console.log("Fetched Sub-Groups:", subGroupData);
      setSubGroups(subGroupData);
    } catch (error) {
      console.error("Error fetching sub-groups:", error);
      setSubGroups([]);

      // Optional: Show user-friendly error
      toast.error(
        error.response?.data?.message || "Failed to fetch sub-groups"
      );
    }
  };

  useEffect(() => {
    // When a bank account is selected, ensure related fields are populated
    if (selectedBankAccount) {
      setFormData((prev) => ({
        ...prev,
        bank_account_id: selectedBankAccount.account_id,
        bank_name: selectedBankAccount.bank_name,
        bank_account_number: selectedBankAccount.account_number,
        bank_ifsc_code: selectedBankAccount.ifsc_code,
        sub_account: "Bank",
        account_head: "Expenses",
      }));
    }
  }, [selectedBankAccount]);

  useEffect(() => {
    fetchCategories();
    fetchCompanies();

    // Only fetch cars if party type is Employee
    if (formData.party_type === "Employee") {
      fetchCars();
    }
  }, [formData.party_type]);

  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        // Always fetch bank accounts when Expenses is selected
        if (formData.account_head === "Expenses") {
          const response =
            await BankAccountService.getAllBankAccountsWithBalance();
          const accounts = response.data.data;
          setBankAccounts(accounts);
          console.log("Fetched Bank Accounts:", initialData);
          // If editing and bank account exists, pre-select it
          if (initialData && initialData.bank_account_id) {
            const selectedAccount = accounts.find(
              (account) => account.account_id === initialData.bank_account_id
            );

            if (selectedAccount) {
              setSelectedBankAccount(selectedAccount);
              setFormData((prev) => ({
                ...prev,
                bank_account_id: initialData.bank_account_id,
              }));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching bank accounts:", error);
        toast.error("Failed to fetch bank accounts");
        setBankAccounts([]); // Ensure bankAccounts is reset on error
      }
    };

    fetchBankAccounts();
  }, [formData.account_head, initialData?.bank_account_id]);

  const ShortcutMenu = () => (
    <div className="absolute top-12 right-0 bg-red-500 border rounded shadow-lg p-4 z-50 w-64">
      <h3 className="text-sm font-semibold mb-2">Keyboard Shortcuts</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span>Save Transaction</span>
          <kbd className="bg-white-200 px-2 py-1 rounded">Ctrl + S</kbd>
        </div>
        <div className="flex justify-between text-xs">
          <span>Reset Form</span>
          <kbd className="bg-white-200 px-2 py-1 rounded">Ctrl + R</kbd>
        </div>
        <div className="flex justify-between text-xs">
          <span>Set Credit</span>
          <kbd className="bg-white-200 px-2 py-1 rounded">Ctrl + C</kbd>
        </div>
        <div className="flex justify-between text-xs">
          <span>Set Debit</span>
          <kbd className="bg-white-200 px-2 py-1 rounded">Ctrl + D</kbd>
        </div>
        <div className="flex justify-between text-xs">
          <span>Close Modal</span>
          <kbd className="bg-white-200 px-2 py-1 rounded">Esc</kbd>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    // Automatically set transaction type based on voucher type
    const getTransactionTypeForVoucherType = (voucherType) => {
      switch (voucherType) {
        case "Payment":
          return "DEBIT";
        case "Receipt":
        case "Sales":
          return "CREDIT";
        case "Purchase":
          return "DEBIT";
        default:
          return formData.transaction_type; // Keep existing type if not matched
      }
    };

    if (formData.voucher_type) {
      const autoTransactionType = getTransactionTypeForVoucherType(
        formData.voucher_type
      );

      setFormData((prev) => ({
        ...prev,
        transaction_type: autoTransactionType,
      }));
    }
  }, [formData.voucher_type]);

  const handleBankAccountSelect = (accountId) => {
    const selectedAccount = bankAccounts.find(
      (account) => account.account_id === accountId
    );

    setSelectedBankAccount(selectedAccount);
    setFormData((prev) => ({
      ...prev,
      bank_account_id: accountId,
      account_head: "Expenses",
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.description)
      newErrors.description = "Description is required";
    if (!formData.amount || formData.amount <= 0)
      newErrors.amount = "Valid amount is required";
    // if (!formData.category) newErrors.category = "Category is required";
    // if (!formData.payment_method)
    //   newErrors.payment_method = "Payment method is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    // Prevent default form submission
    if (e) {
      e.preventDefault();
    }

    // Reset any previous errors
    setSubmitError(null);
    setLoading(true);

    try {
      // Validate form
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      console.log("Form Data:", formData);
      // Prepare transaction data
      const transactionData = {
        ...formData,
        company_id:
          formData.party_type === "Employee" ? null : formData.company_id,
        car_id: formData.party_type === "Employee" ? formData.car_id : null,
        // Explicitly include sub_group if it exists
        ...(formData.sub_group && { sub_group: formData.sub_group }),
      };

      // Remove empty string values
      Object.keys(transactionData).forEach((key) => {
        if (transactionData[key] === "") {
          delete transactionData[key];
        }
      });

      // Explicitly remove notes if it exists
      delete transactionData.notes;

      console.log("Submitting Transaction:", transactionData);

      // Handle Transaction (Daybook)
      if (mode === "add") {
        await onSubmit(transactionData);
      } else if (mode === "edit" && initialData.transaction_id) {
        // For edit mode, include transaction_id
        await onSubmit({
          ...transactionData,
          transaction_id: initialData.transaction_id,
        });
      }

      // Close modal after successful submission
      onClose();
    } catch (error) {
      console.error("Error processing transaction:", error);
      setSubmitError(
        error.response?.data?.message ||
          "Failed to process transaction. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    // Check if the category already exists
    const existingCategory = categories.find(
      (category) => category.name.toLowerCase() === newCategory.toLowerCase()
    );

    if (existingCategory) {
      toast.error("This group already exists");
      return;
    }

    try {
      await axios.post(
        `${Config.API_BASE_URL}/daybook/addCategory`,
        { name: newCategory },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setNewCategory("");
      setShowAddCategory(false);
      fetchCategories();

      // Optionally, set the newly added category as selected
      setFormData((prev) => ({
        ...prev,
        category: newCategory,
      }));
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add group");
    }
  };

  const handleAddCompany = async (companyData) => {
    try {
      const response = await axios.post(
        `${Config.API_BASE_URL}/addCompany`,
        companyData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setShowAddCompanyModal(false);
      fetchCompanies(); // Refresh the companies list
    } catch (error) {
      console.error("Error adding company:", error);
    }
  };

  const handlePartySelect = (selectedValue) => {
    if (formData.party_type === "Employee") {
      // For Employee, selectedValue is the car_id
      const selectedCar = cars.find((car) => car.car_id === selectedValue);

      if (selectedCar) {
        setFormData((prevState) => ({
          ...prevState,
          car_id: selectedCar.car_id,
          party_name: `${selectedCar.car_id} - ${selectedCar.car_model}`,
          company_id: "", // Ensure company_id is cleared
        }));
      }
    } else {
      // Existing logic for other party types
      const selectedCompany = companies.find(
        (company) => company.company_id.toString() === selectedValue
      );

      if (selectedCompany) {
        setFormData((prevState) => ({
          ...prevState,
          company_id: selectedValue,
          car_id: "", // Ensure car_id is cleared
          party_name: selectedCompany.company_name,
        }));
      }
    }
  };

  const handlePartyTypeChange = (partyType) => {
    const resetFields = {
      ...formData,
      party_type: partyType,
      company_id: "",
      car_id: "",
      party_name: "",
    };

    setFormData(resetFields);

    // Fetch cars if Employee is selected
    if (partyType === "Employee") {
      fetchCars();
    }
  };

  const handleCategoryChange = useCallback(
    (selectedCategory) => {
      const category = categories.find((cat) => cat.name === selectedCategory);

      setFormData((prev) => ({
        ...prev,
        category: selectedCategory,
        sub_group: "", // Reset sub-group when category changes
      }));

      if (category) {
        setSelectedCategory(category);
        fetchSubGroups(category.category_id);
      } else {
        setSelectedCategory(null);
        setSubGroups([]);
      }
    },
    [categories, fetchSubGroups]
  );

  const handleAddSubGroup = async () => {
    if (!selectedCategory) {
      toast.error("Please select a category first");
      return;
    }

    try {
      const response = await axios.post(
        `${Config.API_BASE_URL}/daybook/addSubGroup`,
        {
          name: newSubGroup,
          categoryId: selectedCategory.category_id,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Refresh sub-groups
      fetchSubGroups(selectedCategory.category_id);

      // Reset and close modal
      setNewSubGroup("");
      setShowAddSubGroup(false);

      // Optionally set the newly added sub-group
      setFormData((prev) => ({
        ...prev,
        sub_group: response.data.data.name,
      }));
    } catch (error) {
      console.error("Error adding sub-group:", error);
      toast.error(error.response?.data?.message || "Failed to add sub-group");
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl + S: Save/Submit
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        handleSubmit();
      }

      // Ctrl + R: Reset Form
      if (event.ctrlKey && event.key === "r") {
        event.preventDefault();
        resetForm();
      }

      // Ctrl + D for Debit
      if (event.ctrlKey && event.key === "d") {
        event.preventDefault();
        setFormData((prev) => ({
          ...prev,
          transaction_type: "DEBIT",
        }));
      }

      // Ctrl + C for Credit
      if (event.ctrlKey && event.key === "c") {
        event.preventDefault();
        setFormData((prev) => ({
          ...prev,
          transaction_type: "CREDIT",
        }));
      }

      // Escape key to close modal
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, handleSubmit]);

  useEffect(() => {
    // When initialData changes, pre-select bank account and handle sub-group
    if (initialData) {
      // Pre-select bank account if applicable
      if (
        initialData.bank_account_id &&
        formData.account_head === "Expenses" &&
        formData.sub_account === "Bank"
      ) {
        const selectedAccount = bankAccounts.find(
          (account) => account.account_id === initialData.bank_account_id
        );

        if (selectedAccount) {
          setSelectedBankAccount(selectedAccount);
          setFormData((prev) => ({
            ...prev,
            bank_account_id: initialData.bank_account_id,
          }));
        }
      }

      // Handle sub-group selection
      if (initialData.category && initialData.sub_group) {
        const category = categories.find(
          (cat) => cat.name === initialData.category
        );

        if (category) {
          setSelectedCategory(category);

          // Fetch sub-groups for the category
          fetchSubGroups(category.category_id).then(() => {
            // Ensure sub-group is set after fetching
            setFormData((prev) => ({
              ...prev,
              category: initialData.category,
              sub_group: initialData.sub_group,
            }));
          });
        }
      }
    }

    console.log("Initial Data:", initialData);
  }, [
    initialData,
    bankAccounts,
    categories,
    formData.account_head,
    formData.sub_account,
  ]);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-full h-[95vh] mx-4 my-4 shadow-2xl border border-gray-200 flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center relative">
          <div>
            <h2 className="text-lg font-bold">
              {initialData ? "Modify Transaction" : "Create New Transaction"}
            </h2>
            <p className="text-xs text-blue-100">
              Voucher Entry | {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="hover:bg-blue-500 p-1 rounded"
              title="Keyboard Shortcuts"
              onClick={() => setShowShortcutMenu(!showShortcutMenu)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            {showShortcutMenu && <ShortcutMenu />}
            <button
              onClick={onClose}
              className="hover:bg-red-500 p-1 rounded"
              title="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-grow overflow-hidden">
          {/* Left Sidebar - Transaction Details */}
          <div className="w-1/4 bg-gray-50 border-r p-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Voucher Type
                </label>
                <select
                  value={formData.voucher_type}
                  onChange={(e) =>
                    setFormData({ ...formData, voucher_type: e.target.value })
                  }
                  className="w-full border rounded p-2 text-xs"
                >
                  <option value="">Select Voucher Type</option>
                  {voucherTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Date
                </label>
                <DatePicker
                  selected={formData.transaction_date}
                  onChange={(date) =>
                    setFormData({ ...formData, transaction_date: date })
                  }
                  className="w-full border rounded p-2 text-xs"
                  dateFormat="yyyy-MM-dd"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Account Head
                </label>
                <select
                  value={formData.account_head}
                  onChange={(e) =>
                    setFormData({ ...formData, account_head: e.target.value })
                  }
                  className="w-full border rounded p-2 text-xs"
                >
                  <option value="">Select Account Head</option>
                  {accountHeads.map((head) => (
                    <option key={head} value={head}>
                      {head}
                    </option>
                  ))}
                </select>
              </div>

              {formData.account_head === "Expenses" && (
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Select Bank Account
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {bankAccounts.map((account) => (
                      <div
                        key={account.account_id}
                        onClick={() =>
                          handleBankAccountSelect(account.account_id)
                        }
                        className={`
            border rounded p-2 cursor-pointer transition-all
            ${
              selectedBankAccount?.account_id === account.account_id ||
              formData.bank_account_id === account.account_id
                ? "border-blue-500 bg-blue-50"
                : "hover:bg-gray-100"
            }
          `}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs font-semibold">
                              {account.bank_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {account.account_number.slice(-4)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold">
                              ₹{account.current_balance.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {bankAccounts.length === 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      No bank accounts available.
                      <button
                        onClick={() => {
                          /* Add method to add bank account */
                        }}
                        className="ml-1 text-blue-500 hover:underline"
                      >
                        Add Bank Account
                      </button>
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Transaction Type
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, transaction_type: "CREDIT" })
                    }
                    className={`w-1/2 p-2 text-xs rounded ${
                      formData.transaction_type === "CREDIT"
                        ? "bg-green-500 text-white"
                        : "bg-white border text-gray-700"
                    }`}
                  >
                    Credit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, transaction_type: "DEBIT" })
                    }
                    className={`w-1/2 p-2 text-xs rounded ${
                      formData.transaction_type === "DEBIT"
                        ? "bg-red-500 text-white"
                        : "bg-white border text-gray-700"
                    }`}
                  >
                    Debit
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form Area */}
          <div className="w-3/4 p-4 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount Section */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Amount
                  </label>
                  <input
                    disabled={formData.sub_group === "INVOICE" || formData.sub_group === "PURCHASE"}
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full border rounded p-2 text-xs"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment_method: e.target.value,
                      })
                    }
                    className="w-full border rounded p-2 text-xs"
                  >
                    <option value="">Select Method</option>
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {method.charAt(0).toUpperCase() +
                          method.slice(1).replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full border rounded p-2 text-xs"
                    placeholder="Enter description"
                  />
                </div>
              </div>

              {/* Party Details */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Party Type
                  </label>
                  <select
                    value={formData.party_type}
                    onChange={(e) => handlePartyTypeChange(e.target.value)}
                    className="w-full border rounded p-2 text-xs h-[34px]"
                  >
                    <option value="">Select Party Type</option>
                    {partyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Party Name
                  </label>
                  <div className="flex items-center space-x-2">
                    {formData.party_type === "Employee" ? (
                      <select
                        value={formData.car_id}
                        onChange={(e) => handlePartySelect(e.target.value)}
                        className="flex-grow border rounded p-2 text-xs h-[34px]"
                      >
                        <option value="">Select Car</option>
                        {cars.map((car) => (
                          <option key={car.car_id} value={car.car_id}>
                            {car.car_id} - {car.car_model}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <>
                        <select
                          value={formData.company_id}
                          onChange={(e) => handlePartySelect(e.target.value)}
                          className="flex-grow border rounded p-2 text-xs h-[34px]"
                        >
                          <option value="">Select Party</option>
                          {companies.map((company) => (
                            <option
                              key={company.company_id}
                              value={company.company_id}
                            >
                              {company.company_name}
                            </option>
                          ))}
                        </select>
                        {formData.party_type &&
                          formData.party_type !== "Employee" && (
                            <button
                              type="button"
                              onClick={() => setShowAddCompanyModal(true)}
                              className="p-2 bg-blue-500 text-white rounded text-xs flex items-center justify-center h-[34px] w-[34px]"
                              title="Add New Party"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          )}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Groups
                  </label>
                  <div className="flex items-center space-x-2">
                    <SearchableInput
                      options={[
                        ...PREDEFINED_GROUPS,
                        ...categories.map((category) => category.name),
                      ]}
                      value={formData.category}
                      onChange={(selectedGroup) => {
                        handleCategoryChange(selectedGroup);
                      }}
                      placeholder="Search Groups"
                      className="flex-grow h-[34px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddGroupModal(true)}
                      className="p-2 bg-blue-500 text-white rounded text-xs flex items-center justify-center h-[34px] w-[34px]"
                      title="Add New Group"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Sub-Group
                  </label>
                  <div className="flex items-center space-x-2">
                    <SearchableInput
                      options={subGroups.map((sg) => sg.name)}
                      value={formData.sub_group}
                      onChange={(selectedSubGroup) =>
                        setFormData({
                          ...formData,
                          sub_group: selectedSubGroup,
                        })
                      }
                      placeholder={
                        subGroups.length > 0
                          ? "Search Sub-Groups"
                          : "No sub-groups available"
                      }
                      className="flex-grow h-[34px]"
                    />
                    {formData.category && (
                      <button
                        type="button"
                        onClick={() => setShowAddSubGroup(true)}
                        className="p-2 bg-blue-500 text-white rounded text-xs flex items-center justify-center h-[34px] w-[34px]"
                        disabled={!selectedCategory}
                        title="Add Sub-Group"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Narration
                  </label>
                  <textarea
                    value={formData.narration}
                    onChange={(e) =>
                      setFormData({ ...formData, narration: e.target.value })
                    }
                    className="w-full border rounded p-2 text-xs"
                    rows="3"
                    placeholder="Enter narration"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}

        <div className="bg-gray-100 px-4 py-3 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
              onClick={resetForm}
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
                ? mode === "edit"
                  ? "Updating..."
                  : "Saving..."
                : mode === "edit"
                ? "Update Transaction"
                : "Save Transaction"}
            </button>
          </div>
          <div className="text-xs text-gray-500">
            Last saved: {new Date().toLocaleString()}
          </div>
        </div>

        {showAddCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Add New Group</h3>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => {
                  // Capitalize first letter
                  const formattedCategory =
                    e.target.value.charAt(0).toUpperCase() +
                    e.target.value.slice(1);
                  setNewCategory(formattedCategory);
                }}
                className="w-full border rounded-lg p-2 mb-4"
                placeholder="Enter group name"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategory(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddCompanyModal && (
          <Suspense fallback={<div>Loading...</div>}>
            <AddCompanyModal
              isOpen={showAddCompanyModal}
              onClose={() => setShowAddCompanyModal(false)}
              onAdd={handleAddCompany}
            />
          </Suspense>
        )}

        {submitError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{submitError}</span>
            <span
              onClick={() => setSubmitError(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
            ></span>
          </div>
        )}

        {showAddSubGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">
                Add New Sub-Group for {selectedCategory.name}
              </h3>
              <input
                type="text"
                value={newSubGroup}
                onChange={(e) => {
                  // Capitalize first letter
                  const formattedSubGroup =
                    e.target.value.charAt(0).toUpperCase() +
                    e.target.value.slice(1);
                  setNewSubGroup(formattedSubGroup);
                }}
                className="w-full border rounded-lg p-2 mb-4"
                placeholder="Enter sub-group name"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubGroup(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddSubGroup}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                  disabled={!newSubGroup.trim()}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddGroupModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Add New Group</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => {
                      // Capitalize first letter
                      const formattedGroup =
                        e.target.value.charAt(0).toUpperCase() +
                        e.target.value.slice(1);
                      setNewGroupName(formattedGroup);
                    }}
                    className="w-full border rounded-lg p-2"
                    placeholder="Enter group name"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddGroupModal(false);
                      setNewGroupName("");
                      setNewSubGroupName("");
                    }}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newGroupName.trim()) {
                        toast.error("Group name is required");
                        return;
                      }

                      try {
                        // Add group
                        const groupResponse = await axios.post(
                          `${Config.API_BASE_URL}/daybook/addCategory`,
                          { name: newGroupName },
                          {
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem(
                                "token"
                              )}`,
                            },
                          }
                        );

                        // If sub-group is provided, add it
                        if (newSubGroupName.trim()) {
                          const categoryId =
                            groupResponse.data.data.category_id;
                          await axios.post(
                            `${Config.API_BASE_URL}/daybook/addSubGroup`,
                            {
                              name: newSubGroupName,
                              categoryId: categoryId,
                            },
                            {
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem(
                                  "token"
                                )}`,
                              },
                            }
                          );
                        }

                        // Refresh data
                        await fetchCategories();

                        // Reset and close modal
                        setShowAddGroupModal(false);
                        setNewGroupName("");
                        setNewSubGroupName("");

                        // Set the newly added group
                        setFormData((prev) => ({
                          ...prev,
                          category: newGroupName,
                        }));

                        toast.success("Group added successfully");
                      } catch (error) {
                        console.error("Error adding group/sub-group:", error);
                        toast.error(
                          error.response?.data?.message || "Failed to add group"
                        );
                      }
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                    disabled={!newGroupName.trim()}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* {formData.party_type && renderPartyNameInput()} */}
      </div>
    </div>
  );
};

export default AddTransactionModal;
