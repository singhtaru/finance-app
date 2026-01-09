import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import PersonalExpenseSection from "../components/PersonalExpenseSection";

export default function Dashboard() {
  const [groups, setGroups] = useState([]);

  // Create group state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [baseCurrency, setBaseCurrency] = useState("INR");
  const [budgetData, setBudgetData] = useState(null);

  // Join group state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchGroups = async () => {
    try {
      const response = await api.get("/groups", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching groups", error);
    }
  };

  const fetchBudget = async () => {
    try {
      const res = await api.get("/ai/budget");
      setBudgetData(res.data);
    } catch (error) {
      console.error("Error fetching budget", error);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchBudget();
  }, []);

  // CREATE GROUP
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        "/groups",
        { name: groupName, baseCurrency },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setGroupName("");
      setBaseCurrency("INR");
      setShowCreateModal(false);
      fetchGroups();
    } catch (error) {
      alert("Failed to create group");
    }
  };

  // JOIN GROUP
  const handleJoinGroup = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        "/groups/join",
        { inviteCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setInviteCode("");
      setShowJoinModal(false);
      fetchGroups();
    } catch (error) {
      alert("Invalid invite code");
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 px-4 max-w-6xl mx-auto">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
          <p className="text-gray-400">Welcome back, manage your groups and expenses.</p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Button onClick={() => setShowCreateModal(true)} className="!py-3 !px-6 shadow-lg shadow-purple-500/20">
            + Create Group
          </Button>
          <Button onClick={() => setShowJoinModal(true)} className="!bg-transparent border border-white/20 !text-white hover:!bg-white/10 !py-3 !px-6">
            Join Group
          </Button>
        </div>
      </div>

      {/* BUDGET WIDGET (Compact) */}
      {budgetData && budgetData.budget > 0 && (
        <div className="max-w-6xl mx-auto mb-10 bg-gradient-to-r from-[#1e1b4b] to-[#2e1065] p-6 rounded-2xl border border-white/10 shadow-2xl cursor-pointer hover:border-[#6C63FF]/50 transition-all group" onClick={() => navigate('/profile')}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-white font-bold text-lg flex items-center gap-3">
              <span className="bg-white/10 p-2 rounded-lg">💰</span>
              Monthly Budget
            </span>
            <span className="text-gray-300 font-medium">₹{budgetData.totalSpent?.toLocaleString()} / <span className="text-white">₹{budgetData.budget?.toLocaleString()}</span></span>
          </div>

          <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden mb-3 backdrop-blur-sm">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${budgetData.totalSpent > budgetData.budget ? "bg-gradient-to-r from-red-500 to-red-600" : "bg-gradient-to-r from-emerald-400 to-emerald-600"}`}
              style={{ width: `${Math.min((budgetData.totalSpent / budgetData.budget) * 100, 100)}%` }}
            ></div>
          </div>

          {budgetData.analysis && (
            <div className="flex items-start gap-2 mt-2">
              <span className="text-yellow-400 mt-1">💡</span>
              <p className="text-sm text-gray-300 italic group-hover:text-white transition-colors">
                {budgetData.analysis}
              </p>
            </div>
          )}
        </div>
      )}

      {/* GROUP LIST HEADER */}
      <h3 className="text-xl font-semibold text-white mb-6 px-4 max-w-6xl mx-auto flex items-center gap-2">
        <span className="w-2 h-8 bg-purple-500 rounded-full inline-block"></span>
        Your Groups
      </h3>

      {/* GROUP LIST */}
      {groups.length === 0 ? (
        <p className="text-gray-400 text-center">No groups found</p>
      ) : (
        <div className="w-full max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card
                key={group._id}
                className="hover:scale-105 transition-transform duration-300 w-full hover:shadow-xl cursor-pointer h-40 flex flex-col justify-center items-center"
              >
                <div
                  className="text-center w-full"
                  onClick={() => navigate(`/groups/${group._id}`)}
                >
                  <h3 className="text-xl font-semibold text-[#03012C] truncate px-4">
                    {group.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Tap to view expenses
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* PERSONAL EXPENSES */}
      <PersonalExpenseSection />


      {/* CREATE GROUP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
          <Card>
            <h3 className="text-xl font-semibold mb-4 text-[#03012C]">
              Create Group
            </h3>

            <form onSubmit={handleCreateGroup}>
              <Input
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="bg-[#F0F2F5] mb-4"
              />

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-[#03012C]">Base Currency</label>
                <select
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#F0F2F5] border-none outline-none text-gray-700"
                >
                  {["INR", "USD", "EUR"].map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" onClick={() => setShowCreateModal(false)} className="bg-gray-400 hover:bg-gray-500 !bg-none !shadow-none text-white">
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* JOIN GROUP MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
          <Card>
            <h3 className="text-xl font-semibold mb-4 text-[#03012C]">
              Join Group
            </h3>

            <form onSubmit={handleJoinGroup}>
              <Input
                placeholder="Invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="bg-[#F0F2F5]"
              />

              <div className="flex justify-end gap-3">
                <Button type="button" onClick={() => setShowJoinModal(false)} className="bg-gray-400 hover:bg-gray-500 !bg-none !shadow-none text-white">
                  Cancel
                </Button>
                <Button type="submit">Join</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Layout>
  );
}
