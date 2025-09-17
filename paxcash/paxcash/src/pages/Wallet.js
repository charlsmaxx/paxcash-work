import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Button, Grid, Chip, Divider, List, ListItem, ListItemText, ListItemIcon, Avatar } from '@mui/material';
import { AccountBalanceWallet, Add, Remove, Payment, Receipt } from '@mui/icons-material';

const mockWallet = {
  balance: 125000,
  currency: 'NGN',
  accountNumber: '1234567890',
  bankName: 'Paxcash Bank',
  isActive: true,
};

const mockTransactions = [
  { id: 1, type: 'deposit', amount: 50000, description: 'Wallet Funding', date: '2024-06-01', status: 'completed' },
  { id: 2, type: 'withdrawal', amount: 20000, description: 'Withdrawal to Bank', date: '2024-06-03', status: 'completed' },
  { id: 3, type: 'transfer', amount: 10000, description: 'Transfer to John Doe', date: '2024-06-05', status: 'completed' },
];

function Wallet() {
  const [wallet] = useState(mockWallet);
  const [transactions] = useState(mockTransactions);

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 5, borderRadius: 3, boxShadow: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <AccountBalanceWallet sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
            Wallet
          </Typography>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
            ₦{wallet.balance.toLocaleString()} {wallet.currency}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Account: {wallet.accountNumber} ({wallet.bankName})
          </Typography>
          <Chip 
            label={wallet.isActive ? 'Active' : 'Inactive'} 
            color={wallet.isActive ? 'success' : 'error'} 
            size="small" 
            sx={{ mt: 1 }}
          />
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button variant="contained" color="primary" startIcon={<Add />} sx={{ fontWeight: 700, borderRadius: 2 }}>
                Fund Wallet
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" color="primary" startIcon={<Remove />} sx={{ fontWeight: 700, borderRadius: 2 }}>
                Withdraw
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" color="primary" startIcon={<Payment />} sx={{ fontWeight: 700, borderRadius: 2 }}>
                Transfer
              </Button>
            </Grid>
          </Grid>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Recent Transactions
        </Typography>
        {transactions.length > 0 ? (
          <List dense>
            {transactions.map((tx) => (
              <ListItem key={tx.id} divider>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: tx.type === 'deposit' ? 'success.main' : tx.type === 'withdrawal' ? 'error.main' : 'primary.main', width: 32, height: 32 }}>
                    {tx.type === 'deposit' ? <Add /> : tx.type === 'withdrawal' ? <Remove /> : <Receipt />}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={tx.description}
                  secondary={`₦${tx.amount.toLocaleString()} • ${tx.date}`}
                />
                <Chip 
                  label={tx.status} 
                  color={tx.status === 'completed' ? 'success' : 'warning'}
                  size="small"
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No transactions yet
          </Typography>
        )}
      </Paper>
    </Container>
  );
}

export default Wallet; 