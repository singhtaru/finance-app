import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";

export default function Settlement() {
  const { id: groupId } = useParams();
  const [balances, setBalances] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSettlement = async () => {
      try {
        const response = await api.get(`/settlements/${groupId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBalances(response.data);
      } catch (error) {
        console.error("Error fetching settlement", error);
      }
    };

    fetchSettlement();
  }, [groupId]);

  const positive = Object.entries(balances).filter(
    ([_, amount]) => amount > 0
  );
  const negative = Object.entries(balances).filter(
    ([_, amount]) => amount < 0
  );

  return (
    <Layout>
      <h2 className="text-2xl font-semibold mb-6 text-[#03012C]">
        Settlement Summary
      </h2>

      {Object.keys(balances).length === 0 ? (
        <p className="text-gray-500">No settlement data available</p>
      ) : (
        <div className="flex justify-center">
          <div className="w-full max-w-3xl space-y-6">
            {/* RECEIVES */}
            <Card>
              <h3 className="text-lg font-semibold mb-4 text-[#03012C]">
                Receives
              </h3>

              {positive.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No one needs to receive money
                </p>
              ) : (
                <ul className="space-y-2">
                  {positive.map(([name, amount]) => (
                    <li
                      key={name}
                      className="flex justify-between text-sm"
                    >
                      <span className="font-medium">{name}</span>
                      <span className="text-green-600">
                        ₹{amount}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* PAYS */}
            <Card>
              <h3 className="text-lg font-semibold mb-4 text-[#03012C]">
                Pays
              </h3>

              {negative.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No one needs to pay
                </p>
              ) : (
                <ul className="space-y-2">
                  {negative.map(([name, amount]) => (
                    <li
                      key={name}
                      className="flex justify-between text-sm"
                    >
                      <span className="font-medium">{name}</span>
                      <span className="text-red-500">
                        ₹{Math.abs(amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}
    </Layout>
  );
}
