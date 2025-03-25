import { useEffect, useState } from "react";
import { getAccounts } from "../services/api";
import { Card, CardContent, Typography, Grid } from "@mui/material";

function Dashboard() {
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAccounts();
        setAccounts(data);
      } catch (error) {
        console.error("Error fetching accounts:", error);
        setError("Error fetching accounts: " + error.message);
      }
    };
    fetchData();
  }, []);

  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      <Grid item xs={12}>
        <Typography variant="h4">Dashboard</Typography>
      </Grid>
      {accounts.map((account) => (
        <Grid item xs={12} sm={6} md={4} key={account._id}>
          <Card>
            <CardContent>
              <Typography variant="h6">{account.accountNumber}</Typography>
              <Typography>Balance: ${account.balance}</Typography>
              <Typography>Role: {account.role}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default Dashboard;
