import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token:", token);
    if (token) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => setAccounts(response.data))
        .catch((error) => console.error("Error fetching accounts:", error));
    }
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <ul>
        {accounts.map((account) => (
          <li key={account._id}>
            {account.accountNumber} - ${account.balance}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
