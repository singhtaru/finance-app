import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import AnalyticsModal from "../components/AnalyticsModal";
import { getCurrencySymbol } from "../utils/currency";

export default function Group() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Other");
  const [currency, setCurrency] = useState("INR");
  const [splitBetween, setSplitBetween] = useState([]);
  const [splitType, setSplitType] = useState("EQUAL"); // EQUAL | EXACT
  const [customAmounts, setCustomAmounts] = useState({});

  const [editingExpense, setEditingExpense] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const token = localStorage.getItem("token");

  // -------------------------
  // Fetch expenses
  // -------------------------
  const fetchExpenses = async () => {
    try {
      const response = await api.get(`/expenses/${groupId}`);
      setExpenses(response.data);
    } catch (error) {
      console.error("Error fetching expenses", error);
    }
  };

  /* AUTH USER */
  // Retrieve stored user. Note: Login stores { id, name, email }
  const [currentUser, setCurrentUser] = useState(null);
  const [currentGroup, setCurrentGroup] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // -------------------------
  // Fetch members
  // -------------------------
  const fetchGroupMembers = async () => {
    try {
      const response = await api.get("/groups");

      const currentGroup = response.data.find(
        (group) => group._id === groupId
      );

      if (currentGroup) {
        setMembers(currentGroup.members);
        setCurrentGroup(currentGroup); // Save full group
        // Default split: all members (only if not editing)
        if (!editingExpense) {
          setSplitBetween(currentGroup.members.map((m) => m._id));
        }
      }
    } catch (error) {
      console.error("Error fetching group members", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchGroupMembers();
  }, [groupId]);

  // -------------------------
  // Toggle split
  // -------------------------
  const toggleMember = (userId) => {
    setSplitBetween((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // -------------------------
  // Open Add Modal
  // -------------------------
  const openAddModal = () => {
    setEditingExpense(null);
    setDescription("");
    setAmount("");
    setSplitType("EQUAL");
    setCategory("Other");
    setCurrency("INR");
    setSplitBetween(members.map(m => m._id));
    setShowModal(true);
  };

  // -------------------------
  // Open Edit Modal
  // -------------------------
  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setDescription(expense.description);
    setAmount(expense.originalAmount || expense.amount); // Show original amount if available
    setCategory(expense.category || "Other");
    setCurrency(expense.currency || "INR");
    setSplitType(expense.splitType || "EQUAL");

    // NEW LOGIC: Map objects back to IDs
    const splitIds = expense.splitBetween.map((splitItem) => {
      // 1. If user is populated object, use _id
      if (splitItem.user && typeof splitItem.user === 'object' && splitItem.user._id) {
        return splitItem.user._id;
      }
      // 2. If user is a string ID (unpopulated), use it
      if (splitItem.user && typeof splitItem.user === 'string') {
        return splitItem.user;
      }
      return null;
    }).filter(id => id);

    // Parse custom amounts if type is EXACT
    const amounts = {};
    if (expense.splitType === 'EXACT' || expense.splitType === 'CUSTOM') {
      expense.splitBetween.forEach(item => {
        const uId = item.user?._id || item.user;
        if (uId) amounts[uId] = item.amount;
      });
      setSplitType("EXACT");
    }

    setCustomAmounts(amounts);
    setSplitBetween(splitIds);
    setShowModal(true);
  };

  // -------------------------
  // Handle Submit (Add or Edit)
  // -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Construct Payload
      let finalSplit = [];

      if (splitType === "EQUAL") {
        // Send array of IDs -> Backend handles equal split
        finalSplit = splitBetween;
      } else {
        // Custom / Exact Split
        // Validation: Check total
        const totalSplit = splitBetween.reduce((sum, uid) => sum + (parseFloat(customAmounts[uid]) || 0), 0);
        if (Math.abs(totalSplit - Number(amount)) > 0.1) {
          alert(`Total split amount (${totalSplit}) must match expense amount (${amount})`);
          return;
        }

        finalSplit = splitBetween.map(uid => ({
          user: uid,
          amount: parseFloat(customAmounts[uid]) || 0,
          paidStatus: false
        }));
      }

      const payload = {
        description,
        amount: Number(amount),
        splitBetween: finalSplit,
        splitType: splitType === "EQUAL" ? "EQUAL" : "EXACT",
        category,
        currency,
        ...(editingExpense ? {} : { groupId })
      };

      if (editingExpense) {
        // Edit mode
        await api.put(`/expenses/${editingExpense._id}`, payload);
      } else {
        // Add mode
        await api.post("/expenses", payload);
      }

      setDescription("");
      setAmount("");
      setAmount("");
      setCategory("Other");
      setCurrency("INR");
      setEditingExpense(null);
      setShowModal(false);
      fetchExpenses();
    } catch (error) {
      console.error("Submit Error:", error);
      const msg = error.response?.data?.message || "Failed to save operation";
      alert(msg);
    }
  };

  /* DELETE EXPENSE */
  const handleDeleteExpense = async () => {
    if (!editingExpense) return;
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    try {
      await api.delete(`/expenses/${editingExpense._id}`);
      setShowModal(false);
      setEditingExpense(null);
      fetchExpenses();
    } catch (error) {
      console.error("Delete Expense Error:", error);
      alert("Failed to delete expense");
    }
  };

  return (
    <Layout>
      <h2 className="text-4xl font-semibold mb-6 text-[#FFFBFA] flex justify-center">
        Group Expenses
      </h2>

      {/* INVITE CODE */}
      {currentGroup && (
        <div className="flex justify-center mb-6">
          <div className="bg-[#FFFFFF]/10 backdrop-blur-md rounded-full px-5 py-2 flex items-center gap-3 border border-white/20 shadow-xl">
            <span className="text-gray-300 text-sm font-medium">Invite Code:</span>
            <span className="text-[#FF6B6B] font-bold tracking-wider">{currentGroup.inviteCode}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(currentGroup.inviteCode);
                alert("Invite code copied!");
              }}
              className="ml-2 text-white hover:text-[#6C63FF] transition-colors"
              title="Copy Code"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex gap-4 mb-6 justify-center">
        <Button onClick={openAddModal}>
          Add Expense
        </Button>
        <Button onClick={() => setShowAnalytics(true)}>
          Analytics 📊
        </Button>
        <Button onClick={() => navigate(`/settlement/${groupId}`)}>
          View Settlement
        </Button>
      </div>

      {/* EXPENSE LIST */}
      {expenses.length === 0 ? (
        <p className="text-gray-500 text-center">No expenses yet</p>
      ) : (
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
            {expenses.map((expense) => {
              // Robust check for payer ID
              const payerId = expense.paidBy?._id || expense.paidBy;
              const currentUserId = currentUser?.id;

              const isOwner = currentUserId && payerId && currentUserId.toString() === payerId.toString();

              return (
                <Card key={expense._id} className="relative">
                  <h3 className="text-lg font-semibold text-[#03012C]">
                    {expense.description}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {/* Show original amount if different from converted/base */}
                    {expense.originalAmount && expense.currency && expense.currency !== "INR" ? (
                      <span>
                        {getCurrencySymbol(expense.currency)} {expense.originalAmount}
                        <span className="text-xs text-gray-400 ml-1">(≈ ₹{expense.amount.toFixed(2)})</span>
                      </span>
                    ) : (
                      <span>{getCurrencySymbol(expense.currency || "INR")}{expense.amount}</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Paid by: {expense.paidBy?.name || "Unknown"} • {expense.category}
                  </p>

                  {/* Check Ownership */}
                  {isOwner && (
                    <button
                      onClick={() => openEditModal(expense)}
                      className="absolute top-6 right-6 text-xs font-bold text-[#6C63FF] hover:text-[#5a52d5] tracking-wide transition-colors uppercase"
                    >
                      Edit
                    </button>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}


      {/* ADD/EDIT EXPENSE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-50 p-4">
          <Card className="max-h-[90vh] overflow-y-auto !p-6 scrollbar-hide">
            <h3 className="text-xl font-semibold mb-4 text-[#03012C] sticky top-0 bg-[#FFFBFA] z-10 pb-2 border-b border-gray-100">
              {editingExpense ? "Edit Expense" : "Add Expense"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-[#F0F2F5] !mb-0"
              />

              <div className="flex gap-3">
                <div className="w-1/3">
                  <label className="block text-xs font-medium mb-1 text-gray-500 ml-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#F0F2F5] border-none outline-none text-gray-700 text-sm h-[46px]"
                  >
                    {["INR", "USD", "EUR"].map(curr => (
                      <option key={curr} value={curr}>{curr} {getCurrencySymbol(curr)}</option>
                    ))}
                  </select>
                </div>
                <div className="w-2/3">
                  <label className="block text-xs font-medium mb-1 text-gray-500 ml-1">Amount</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-[#F0F2F5] !mb-0 text-lg font-semibold"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className="block text-xs font-medium mb-1 text-gray-500 ml-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#F0F2F5] border-none outline-none text-gray-700 text-sm"
                  >
                    {["Food", "Travel", "Rent", "Utilities", "Entertainment", "Other"].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-medium mb-1 text-gray-500 ml-1">Split Method</label>
                  <div className="flex bg-[#F0F2F5] rounded-xl p-1 h-[42px]">
                    <button
                      type="button"
                      onClick={() => setSplitType("EQUAL")}
                      className={`flex-1 rounded-lg text-xs font-medium transition-all ${splitType === 'EQUAL' ? 'bg-white shadow text-[#6C63FF]' : 'text-gray-500 hover:bg-gray-200'}`}
                    >
                      Equal
                    </button>
                    <button
                      type="button"
                      onClick={() => setSplitType("EXACT")}
                      className={`flex-1 rounded-lg text-xs font-medium transition-all ${splitType === 'EXACT' ? 'bg-white shadow text-[#6C63FF]' : 'text-gray-500 hover:bg-gray-200'}`}
                    >
                      Custom
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2 text-[#03012C]">
                  Select Members:
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar bg-[#F0F2F5] p-3 rounded-xl">
                  {members.map((member) => {
                    const isChecked = splitBetween.includes(member._id);
                    return (
                      <div key={member._id} className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-purple-100 transition-colors">
                        <label className="flex items-center gap-3 text-sm text-[#03012C] cursor-pointer w-full">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleMember(member._id)}
                            className="w-4 h-4 text-[#6C63FF] rounded focus:ring-[#6C63FF]"
                          />
                          <span className="font-medium">{member.name}</span>
                        </label>

                        {/* Custom Amount Input */}
                        {splitType === "EXACT" && isChecked && (
                          <div className="flex items-center gap-1 border-l pl-3 ml-2">
                            <span className="text-gray-500 text-xs">{getCurrencySymbol(currency)}</span>
                            <input
                              type="number"
                              placeholder="0"
                              className="w-20 p-1 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-[#6C63FF] outline-none text-right"
                              value={customAmounts[member._id] || ""}
                              onChange={(e) => setCustomAmounts(prev => ({
                                ...prev,
                                [member._id]: e.target.value
                              }))}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center gap-3 pt-4 border-t border-gray-100">
                {editingExpense && (
                  <button
                    type="button"
                    onClick={handleDeleteExpense}
                    className="text-red-500 hover:text-red-600 text-sm font-medium px-2"
                  >
                    Delete
                  </button>
                )}
                <div className="flex gap-3 ml-auto">
                  <Button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-400 hover:bg-gray-500 !bg-none !shadow-none text-white px-6"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="px-8 shadow-lg shadow-purple-500/20">
                    {editingExpense ? "Update" : "Add"}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}
      {/* ANALYTICS MODAL */}
      {showAnalytics && (
        <AnalyticsModal
          groupId={groupId}
          onClose={() => setShowAnalytics(false)}
        />
      )}
    </Layout>
  );
}
