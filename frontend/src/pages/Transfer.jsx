import { useState, useContext } from "react";
import axios from "axios";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

function Transfer() {
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage("Please log in to transfer funds.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      // eslint-disable-next-line no-unused-vars
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/transfer`,
        { fromAccount, toAccount, amount: parseFloat(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Transfer successful!");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      setMessage(
        "Transfer failed: " + (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: "auto", mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Transfer Funds
      </Typography>
      <form onSubmit={handleTransfer}>
        <TextField
          fullWidth
          value={fromAccount}
          onChange={(e) => setFromAccount(e.target.value)}
          placeholder="From Account"
          margin="normal"
          required
        />
        <TextField
          fullWidth
          value={toAccount}
          onChange={(e) => setToAccount(e.target.value)}
          placeholder="To Account"
          margin="normal"
          required
        />
        <TextField
          fullWidth
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Transfer
        </Button>
      </form>
      {message && (
        <Typography
          color={message.includes("successful") ? "success" : "error"}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}

export default Transfer;
