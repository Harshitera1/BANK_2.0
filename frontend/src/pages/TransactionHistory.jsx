import { useEffect, useState, useContext } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import { AuthContext } from "../context/AuthContext.jsx";

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && user) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/users/user-transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          console.log("Transactions fetched:", response.data);
          setTransactions(response.data);
        })
        .catch((error) => {
          console.error("Error fetching transactions:", error);
          setError(
            "Failed to fetch transactions: " +
              (error.response?.data?.message || error.message)
          );
        });
    } else {
      setError("Please log in to view transactions.");
    }
  }, [user]);

  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Transaction History
      </Typography>
      {transactions.length === 0 ? (
        <Typography>No transactions found.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Account</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction._id}>
                <TableCell>{transaction.transactionId}</TableCell>
                <TableCell>{transaction.userAccount}</TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell>${transaction.amount}</TableCell>
                <TableCell>
                  {new Date(transaction.date).toLocaleString()}
                </TableCell>
                <TableCell>{transaction.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
}

export default TransactionHistory;
