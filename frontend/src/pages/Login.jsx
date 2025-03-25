import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography } from "@mui/material";
import { AuthContext } from "../context/AuthContext.jsx";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/login`,
        {
          email,
          password,
        }
      );
      login(response.data.token);
      setMessage("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setMessage(
        "Login failed: " + (error.response?.data?.message || "Unknown error")
      );
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: "auto", mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <form onSubmit={handleLogin}>
        <TextField
          fullWidth
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          margin="normal"
          required
        />
        <TextField
          fullWidth
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Login
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

export default Login;
