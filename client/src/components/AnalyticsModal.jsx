import { useEffect, useState } from "react";
import api from "../services/api";
import Card from "./Card";
import Button from "./Button";

export default function AnalyticsModal({ groupId, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get(`/expenses/${groupId}/analytics`);
                setData(res.data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [groupId]);

    if (!data && !loading) return null;

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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-50 p-4">
            {/* Dark Theme Card Override */}
            <div className="bg-[#03012C] rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Group Analytics 📊</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>

                {loading ? (
                    <div className="py-10 text-center text-gray-400">Loading insights...</div>
                ) : (
                    <div className="flex flex-col gap-6">

                        {/* SUMMARY CARDS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-[#1e1b4b] p-4 rounded-xl border border-gray-700">
                                <p className="text-sm text-gray-400 mb-1">Total Group Spending</p>
                                <p className="text-3xl font-bold text-white">₹{data.total.toLocaleString()}</p>
                            </div>
                            <div className="bg-[#1e1b4b] p-4 rounded-xl border border-gray-700">
                                <p className="text-sm text-gray-400 mb-1">Top Spender 👑</p>
                                {data.topSpender ? (
                                    <div>
                                        <p className="text-xl font-bold text-white">{data.topSpender.name}</p>
                                        <p className="text-sm text-green-400 font-medium">₹{data.topSpender.amount.toLocaleString()}</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No spending yet</p>
                                )}
                            </div>
                        </div>

                        {/* CATEGORY BREAKDOWN */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">Category Breakdown</h3>
                            {Object.keys(data.categoryBreakdown).length === 0 ? (
                                <p className="text-gray-500 text-sm">No expenses categorized yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {Object.entries(data.categoryBreakdown)
                                        .sort(([, a], [, b]) => b - a) // Sort by amount desc
                                        .map(([cat, amount]) => {
                                            const percentage = ((amount / data.total) * 100).toFixed(1);
                                            return (
                                                <div key={cat} className="flex flex-col gap-1">
                                                    <div className="flex justify-between text-sm font-medium text-gray-300">
                                                        <span className="flex items-center gap-2">
                                                            {categoryIcons[cat] || "📝"} {cat}
                                                        </span>
                                                        <span>₹{amount.toLocaleString()} ({percentage}%)</span>
                                                    </div>
                                                    {/* Progress Bar */}
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

                        {/* MONTHLY BREAKDOWN */}
                        {data.monthlyBreakdown && Object.keys(data.monthlyBreakdown).length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Monthly Spending 📅</h3>
                                <div className="space-y-3">
                                    {Object.entries(data.monthlyBreakdown).map(([month, amount]) => (
                                        <div key={month} className="flex justify-between border-b border-gray-700 pb-2">
                                            <span className="text-gray-300 font-medium">{month}</span>
                                            <span className="text-white font-bold">₹{amount.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-4 flex justify-end">
                            <Button onClick={onClose} className="!bg-gray-700 !text-white hover:!bg-gray-600">
                                Close
                            </Button>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
