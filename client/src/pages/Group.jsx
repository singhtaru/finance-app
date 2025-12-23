import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";

export default function Group() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [splitBetween, setSplitBetween] = useState([]);

  const token = localStorage.getItem("token");

  // -------------------------
  // Fetch expenses
  // -------------------------
  const fetchExpenses = async () => {
    try {
      const response = await api.get(`/expenses/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(response.data);
    } catch (error) {
      console.error("Error fetching expenses", error);
    }
  };

  // -------------------------
  // Fetch members
  // -------------------------
  const fetchGroupMembers = async () => {
    try {
      const response = await api.get("/groups", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const currentGroup = response.data.find(
        (group) => group._id === groupId
      );

      if (currentGroup) {
        setMembers(currentGroup.members);
        setSplitBetween(currentGroup.members.map((m) => m._id));
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
  // Add expense
  // -------------------------
  const handleAddExpense = async (e) => {
    e.preventDefault();

    try {
      await api.post(
        "/expenses",
        { description, amount, groupId, splitBetween },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDescription("");
      setAmount("");
      setShowModal(false);
      fetchExpenses();
    } catch (error) {
      alert("Failed to add expense");
    }
  };

  return (
    <Layout>
      <h2 className="text-4xl font-semibold mb-6 text-[#03012C] flex justify-center">
        Group Expenses
      </h2>

      {/* ACTIONS */}
      <div className="flex gap-4 mb-6 justify-center">
        <Button onClick={() => setShowModal(true)}>
          Add Expense
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
      {expenses.map((expense) => (
        <Card key={expense._id}>
          <h3 className="text-lg font-semibold text-[#03012C]">
            {expense.description}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            ₹{expense.amount}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Paid by: {expense.paidBy?.name}
          </p>
        </Card>
      ))}
    </div>
  </div>
)}


      {/* ADD EXPENSE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <Card>
            <h3 className="text-xl font-semibold mb-4 text-[#03012C]">
              Add Expense
            </h3>

            <form onSubmit={handleAddExpense}>
              <Input
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <Input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <p className="text-sm font-medium mb-2 text-[#03012C]">
                Split between:
              </p>

              <div className="space-y-2 mb-4">
                {members.map((member) => (
                  <label
                    key={member._id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={splitBetween.includes(member._id)}
                      onChange={() => toggleMember(member._id)}
                    />
                    {member.name}
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Layout>
  );
}
