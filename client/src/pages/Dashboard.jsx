import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";

export default function Dashboard() {
  const [groups, setGroups] = useState([]);

  // Create group state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState("");

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

  useEffect(() => {
    fetchGroups();
  }, []);

  // CREATE GROUP
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        "/groups",
        { name: groupName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setGroupName("");
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
      <h2 className="text-4xl font-semibold mb-6 text-[#0e0c2d] flex justify-center">
        My Groups
      </h2>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4 mb-6 justify-center">
        <Button onClick={() => setShowCreateModal(true)} className="text-xl">
          Create Group
        </Button>
        <Button onClick={() => setShowJoinModal(true)} className="text-xl">
          Join Group
        </Button>
      </div>

      {/* GROUP LIST */}
{groups.length === 0 ? (
  <p className="text-gray-500 text-center">No groups found</p>
) : (
  <div className="flex justify-center">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full place-items-center">
      {groups.map((group) => (
        <Card
          key={group._id}
          className="hover:scale-105 transition-transform duration-300 w-full max-w-sm"
        >
          <div
            className="cursor-pointer text-center"
            onClick={() => navigate(`/groups/${group._id}`)}
          >
            <h3 className="text-xl font-semibold text-[#03012C]">
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


      {/* CREATE GROUP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <Card>
            <h3 className="text-xl font-semibold mb-4 text-[#03012C]">
              Create Group
            </h3>

            <form onSubmit={handleCreateGroup}>
              <Input
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />

              <div className="flex justify-end gap-3">
                <Button type="button" onClick={() => setShowCreateModal(false)}>
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <Card>
            <h3 className="text-xl font-semibold mb-4 text-[#03012C]">
              Join Group
            </h3>

            <form onSubmit={handleJoinGroup}>
              <Input
                placeholder="Invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />

              <div className="flex justify-end gap-3">
                <Button type="button" onClick={() => setShowJoinModal(false)}>
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
