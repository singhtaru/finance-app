import { useState, useEffect } from "react";
import api from "../services/api";
import Card from "./Card";
import Button from "./Button";
import Input from "./Input";
import { getCurrencySymbol } from "../utils/currency";

export default function PersonalExpenseSection() {
    const [expenses, setExpenses] = useState([]);
    const [showModal, setShowModal] = useState(false);

    // Edit State
    const [editMode, setEditMode] = useState(false);
    const [currentExpenseId, setCurrentExpenseId] = useState(null);

    // Form State
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Other");
    const [currency, setCurrency] = useState("INR");

    const fetchPersonalExpenses = async () => {
        try {
            const response = await api.get("/expenses/personal");
            // Sort by date desc
            const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setExpenses(sorted);
        } catch (error) {
            console.error("Error fetching personal expenses", error);
        }
    };

    useEffect(() => {
        fetchPersonalExpenses();
    }, []);

    const handleEditClick = (expense) => {
        setEditMode(true);
        setCurrentExpenseId(expense._id);
        setDescription(expense.description);
        setAmount(expense.amount.toString()); // Note: This might be the base currency amount if converted. 
        // ideally we should store original currency/amount or allow editing in base. 
        // For now assuming simplified simple edit.
        setCurrency(expense.currency || "INR");
        setCategory(expense.category);
        setShowModal(true);
    };

    const handleAddClick = () => {
        setEditMode(false);
        setCurrentExpenseId(null);
        setDescription("");
        setAmount("");
        setCurrency("INR");
        setCategory("Other");
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                description,
                amount: Number(amount),
                currency,
                category,
                splitBetween: ["SELF"],
                splitType: "EQUAL"
            };

            if (editMode && currentExpenseId) {
                await api.put(`/expenses/${currentExpenseId}`, payload);
            } else {
                await api.post("/expenses", payload);
            }

            setShowModal(false);
            setDescription("");
            setAmount("");
            fetchPersonalExpenses();
        } catch (error) {
            console.error("Expense Operation Error:", error);
            alert("Failed to save expense");
        }
    };

    const handleDeleteExpense = async () => {
        if (!currentExpenseId) return;
        if (!window.confirm("Are you sure you want to delete this expense?")) return;

        try {
            await api.delete(`/expenses/${currentExpenseId}`);
            setShowModal(false);
            fetchPersonalExpenses();
        } catch (error) {
            console.error("Delete Expense Error:", error);
            alert("Failed to delete expense");
        }
    };

    // --- Helpers for Grouping & Stats ---

    // 1. Stats
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0); // Simplified (assuming mixed currencies might be issue, but purely summing for now or assume single currency preference in future. For now summing raw values if mostly same currency, or just showing count)
    // Actually, let's just show Total Expenses count and maybe most recent amount for now to avoid currency mix chaos without conversion.
    // Or better: Filter by INR (base) if possible. Let's just sum all for simplicity as "Total Value" is tricky. 
    // Let's show "Transactions: X" and "This Month: Y" (filtering current month).
    const currentMonthExpenses = expenses.filter(e => {
        const d = new Date(e.createdAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const spentThisMonth = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // 2. Group by Date
    const groupedExpenses = expenses.reduce((groups, expense) => {
        const dateObj = new Date(expense.createdAt);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        // Check for Today/Yesterday
        const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        let header = dateStr;
        if (dateStr === today) header = "Today";
        else if (dateStr === yesterday) header = "Yesterday";

        if (!groups[header]) groups[header] = [];
        groups[header].push(expense);
        return groups;
    }, {});

    const groupKeys = Object.keys(groupedExpenses); // already sorted if expenses were sorted? Object keys order is complex, better to use an array of objects.

    // Let's use array for reliable ordering
    const groupsArray = [];
    expenses.forEach(expense => {
        const dateObj = new Date(expense.createdAt);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        let header = dateStr;
        if (dateStr === today) header = "Today";
        else if (dateStr === yesterday) header = "Yesterday";

        let existingGroup = groupsArray.find(g => g.title === header);
        if (!existingGroup) {
            existingGroup = { title: header, items: [], dateVal: dateObj };
            groupsArray.push(existingGroup);
        }
        existingGroup.items.push(expense);
    });
    // Ensure groups are sorted by date desc (though they should be if expenses are sorted)
    // Actually map insertion order handles it mostly, but let's rely on expenses sort.

    return (
        <div className="mt-12 w-full max-w-6xl mx-auto px-4 pb-20">
            {/* Header & Add Button */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex flex-col">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        <span className="w-2 h-8 bg-pink-500 rounded-full inline-block"></span>
                        Personal Expenses
                    </h3>
                    <p className="text-gray-400 text-sm ml-4 mt-1">Track your daily spending</p>
                </div>

                <Button onClick={handleAddClick} className="!py-2 !px-4 shadow-lg shadow-pink-500/20 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                    + Add Expense
                </Button>
            </div>

            {/* Summary Stats (Simple) */}
            {expenses.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
                        <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">This Month</p>
                        <p className="text-2xl font-bold text-pink-400 mt-1">₹{spentThisMonth.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
                        <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Total Trans.</p>
                        <p className="text-2xl font-bold text-white mt-1">{expenses.length}</p>
                    </div>
                </div>
            )}

            {/* Grouped List */}
            {expenses.length === 0 ? (
                <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-gray-400">No personal expenses tracked yet.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {groupsArray.map((group) => (
                        <div key={group.title}>
                            <h4 className="text-gray-400 font-medium mb-3 ml-1 text-sm">{group.title}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {group.items.map(expense => (
                                    <div
                                        key={expense._id}
                                        className="bg-[#FFFBFA] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border-l-4 border-pink-500 flex justify-between items-center group relative overflow-hidden"
                                    >

                                        <div className="flex flex-col" onClick={() => handleEditClick(expense)}>
                                            <span className="text-[#03012C] font-semibold text-base cursor-pointer hover:text-pink-600">{expense.description}</span>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md w-fit mt-1">{expense.category}</span>
                                            <span className="text-[10px] text-gray-400 mt-1">{new Date(expense.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <p className="text-lg font-bold text-[#03012C]">
                                                {getCurrencySymbol(expense.currency)} {expense.amount}
                                            </p>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEditClick(expense); }}
                                                className="text-gray-400 hover:text-pink-500 transition-colors p-1"
                                                title="Edit Expense"
                                            >
                                                ✏️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ADD MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-50">
                    <Card>
                        <h3 className="text-xl font-semibold mb-4 text-[#03012C]">
                            {editMode ? "Edit Expense" : "Add Personal Expense"}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <Input
                                placeholder="Description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="bg-[#F0F2F5]"
                            />
                            <div className="flex gap-2 mb-4">
                                <select
                                    value={currency}
                                    onChange={e => setCurrency(e.target.value)}
                                    className="px-4 py-2.5 rounded-xl bg-[#F0F2F5] border-none outline-none text-gray-700 w-1/3"
                                >
                                    {["INR", "USD", "EUR"].map(c => <option key={c} value={c}>{c} {getCurrencySymbol(c)}</option>)}
                                </select>
                                <Input
                                    type="number"
                                    placeholder="Amount"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="bg-[#F0F2F5] w-2/3 !mb-0"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1 text-[#03012C]">Category</label>
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-[#F0F2F5] border-none outline-none text-gray-700"
                                >
                                    {["Food", "Travel", "Rent", "Utilities", "Entertainment", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="flex justify-between items-center gap-3 mt-6 pt-4 border-t border-gray-100">
                                {editMode && (
                                    <button
                                        type="button"
                                        onClick={handleDeleteExpense}
                                        className="group flex items-center gap-2 text-gray-400 hover:text-red-500 transition-all text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50"
                                        title="Delete Expense"
                                    >
                                        <span className="grayscale group-hover:grayscale-0 transition-all opacity-70 group-hover:opacity-100">🗑️</span>
                                        <span>Delete</span>
                                    </button>
                                )}
                                <div className="flex gap-3 ml-auto">
                                    <Button type="button" onClick={() => setShowModal(false)} className="bg-gray-400 hover:bg-gray-500 !bg-none !shadow-none text-white">Cancel</Button>
                                    <Button type="submit">{editMode ? "Update" : "Add"}</Button>
                                </div>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
