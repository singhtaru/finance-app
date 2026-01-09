import Layout from "../components/Layout";
import Card from "../components/Card";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [budgetData, setBudgetData] = useState(null);
    const [aiInsights, setAiInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingBudget, setEditingBudget] = useState(false);
    const [newBudget, setNewBudget] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const fetchData = async () => {
            try {
                const [statsRes, budgetRes, insightsRes] = await Promise.all([
                    api.get("/users/stats"),
                    api.get("/ai/budget"),
                    api.get("/ai/insights")
                ]);

                setStats(statsRes.data);
                setBudgetData(budgetRes.data);
                setAiInsights(insightsRes.data);
                if (budgetRes.data?.budget) setNewBudget(budgetRes.data.budget);

            } catch (error) {
                console.error("Failed to fetch user data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleUpdateBudget = async () => {
        try {
            const res = await api.put("/users/budget", { monthlyBudget: Number(newBudget) });
            setBudgetData(prev => ({ ...prev, budget: res.data.monthlyBudget }));
            setEditingBudget(false);
            alert("Budget updated! AI analysis will refresh on next load.");
        } catch (error) {
            console.error("Failed to update budget", error);
        }
    };

    // Icons for categories
    const categoryIcons = {
        Food: "🍔",
        Travel: "✈️",
        Rent: "🏠",
        Utilities: "⚡",
        Entertainment: "🎮",
        Other: "📝"
    };

    return (
        <Layout>
            <div className="flex flex-col items-center mt-10 max-w-2xl mx-auto gap-6">

                {/* PROFILE INFO CARD */}
                <Card>
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-[#6C63FF] rounded-full flex items-center justify-center text-3xl text-white font-bold mb-4 shadow-lg">
                            {user?.name?.charAt(0) || "U"}
                        </div>
                        <h2 className="text-2xl font-bold text-[#03012C]">{user?.name || "User Name"}</h2>
                        <p className="text-gray-500">{user?.email || "user@example.com"}</p>
                    </div>
                </Card>

                {/* STATS CARD */}
                <div className="w-full bg-[#03012C] rounded-2xl shadow-xl p-6 border border-gray-800">

                    {/* BUDGET SECTION */}
                    {budgetData && (
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span>💰</span> Monthly Budget
                                </h3>
                                {!editingBudget ? (
                                    <button
                                        onClick={() => setEditingBudget(true)}
                                        className="px-4 py-2 bg-[#6C63FF] text-white rounded-lg text-sm hover:bg-[#5b54d6] transition-colors"
                                    >
                                        {budgetData.budget === 0 ? "Set Budget" : "Edit Budget"}
                                    </button>
                                ) : (
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="number"
                                            value={newBudget}
                                            onChange={(e) => setNewBudget(e.target.value)}
                                            placeholder="Ex: 5000"
                                            className="w-32 p-2 text-white bg-[#03012C] border border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-[#6C63FF] outline-none placeholder-gray-500"
                                            autoFocus
                                        />
                                        <button onClick={handleUpdateBudget} className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">Save</button>
                                        <button onClick={() => setEditingBudget(false)} className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">Cancel</button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-[#1e1b4b] p-5 rounded-xl border border-gray-700 mb-4">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-gray-400">Spent / Budget</span>
                                    <span className="text-white font-bold text-lg">
                                        ₹{(budgetData.totalSpent || 0).toLocaleString()} / ₹{(budgetData.budget || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="h-3 w-full bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${budgetData.totalSpent > budgetData.budget ? "bg-red-500" : "bg-green-500"}`}
                                        style={{ width: `${budgetData.budget > 0 ? Math.min((budgetData.totalSpent / budgetData.budget) * 100, 100) : 0}%` }}
                                    ></div>
                                </div>
                                {budgetData.analysis && (
                                    <div className="mt-4 bg-[#03012C]/50 p-3 rounded-lg border border-[#6C63FF]/30">
                                        <p className="text-[#6C63FF] text-sm font-semibold mb-1">🤖 AI Budget Advisor</p>
                                        <p className="text-gray-300 text-sm italic">"{budgetData.analysis}"</p>
                                        <ul className="mt-2 text-xs text-gray-400 list-disc list-inside">
                                            {budgetData.tips?.map((tip, i) => <li key={i}>{tip}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}


                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span>📊</span> My Spending Insights
                    </h3>

                    {/* AI INSIGHTS */}
                    {aiInsights && aiInsights.length > 0 && (
                        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {aiInsights.map((insight, idx) => (
                                <div key={idx} className="bg-gradient-to-br from-[#1e1b4b] to-[#2d2a6e] p-4 rounded-xl border border-gray-700 shadow-md">
                                    <div className="text-2xl mb-2">💡</div>
                                    <p className="text-gray-200 text-sm font-medium leading-relaxed">{insight}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {loading ? (
                        <div className="py-10 text-center text-gray-400">Loading stats...</div>
                    ) : stats ? (
                        <div className="flex flex-col gap-6">

                            {/* TOTAL SPENT */}
                            <div className="bg-[#1e1b4b] p-5 rounded-xl border border-gray-700">
                                <p className="text-sm text-gray-400 mb-1">Total Lifetime Spending</p>
                                <p className="text-4xl font-bold text-white">₹{stats.totalSpent.toLocaleString()}</p>
                            </div>

                            {/* CATEGORY BREAKDOWN */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-300 mb-3 uppercase tracking-wider text-xs">Category Breakdown</h4>
                                {Object.keys(stats.categoryBreakdown).length === 0 ? (
                                    <p className="text-gray-500 text-sm italic">No expenses recorded yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {Object.entries(stats.categoryBreakdown)
                                            .sort(([, a], [, b]) => b - a)
                                            .map(([cat, amount]) => {
                                                const percentage = stats.totalSpent > 0 ? ((amount / stats.totalSpent) * 100).toFixed(1) : 0;
                                                return (
                                                    <div key={cat}>
                                                        <div className="flex justify-between text-sm font-medium text-gray-300 mb-1">
                                                            <span className="flex items-center gap-2">
                                                                {categoryIcons[cat] || "📝"} {cat}
                                                            </span>
                                                            <span>₹{amount.toLocaleString()} <span className="text-gray-500 text-xs">({percentage}%)</span></span>
                                                        </div>
                                                        <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-[#FF6B6B] rounded-full"
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-400">Failed to load statistics.</p>
                    )}
                </div>
            </div>
        </Layout>
    );
}
