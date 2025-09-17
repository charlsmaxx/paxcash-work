import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Box, 
  Card, 
  CardContent,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress
} from '@mui/material';
import LoyaltyStatus from '../components/LoyaltyStatus';
import EnableNotifications from '../components/EnableNotifications';
import { 
  AccountBalance, 
  Payment, 
  Receipt, 
  Logout, 
  Person,
  Email,
  Phone,
  AccountBalanceWallet,
  Assessment,
  CreditCard
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSolutions, setShowSolutions] = useState(false);
  const [virtualAccount, setVirtualAccount] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchVirtualAccount();
      
      // Poll for updates every 5 seconds for faster updates
      const interval = setInterval(() => {
        fetchUserData();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch wallet data
      const walletResponse = await fetch(`http://localhost:5000/api/wallet?userId=${user.id}`);
      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        setWallet(walletData.wallet);
      }

      // Fetch transactions
      const transactionsResponse = await fetch(`http://localhost:5000/api/transactions?userId=${user.id}&limit=5`);
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVirtualAccount = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/virtual-account/status?userId=${user.id}`);
      const data = await res.json();
      if (data.success && data.isActivated) {
        setVirtualAccount(data.virtualAccount);
      } else {
        setVirtualAccount(null);
      }
    } catch (error) {
      setVirtualAccount(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading your dashboard...</Typography>
      </Container>
    );
  }

  const kycVerified = user?.kycVerified || false; // Replace with real field if available

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" gutterBottom color="primary">
            Welcome back, {user?.firstName}!
          </Typography>
          {kycVerified && (
            <Chip label="KYC Verified" color="success" sx={{ fontWeight: 700, fontSize: '1rem', ml: 2 }} />
          )}
        </Box>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Logout />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      {/* Notifications quick toggle */}
      <EnableNotifications userId={user?.id} />

      {/* Loyalty Status */}
      <LoyaltyStatus userId={user?.id} />

      <Grid container spacing={3}>
        {/* User Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Paxcash User
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Email fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email" 
                    secondary={user?.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Phone fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Phone" 
                    secondary={user?.phoneNumber}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {virtualAccount && (
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3, background: '#fffde7' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Virtual Account</Typography>
                </Box>
                <Typography variant="h5" color="primary" gutterBottom>
                  {virtualAccount.accountNumber}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Bank: {virtualAccount.bankName}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Name: {virtualAccount.accountName}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label={virtualAccount.status ? 'Active' : 'Inactive'} 
                    color={virtualAccount.status ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Wallet Balance */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceWallet sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Wallet Balance</Typography>
              </Box>
              <Typography variant="h3" color="primary" gutterBottom>
                ₦{wallet?.balance?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Account: {wallet?.accountNumber || 'Not created yet'}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label={wallet?.isActive ? 'Active' : 'Inactive'} 
                  color={wallet?.isActive ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Payment />}
                    onClick={() => navigate('/transfer')}
                  >
                    Send Money
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Receipt />}
                    onClick={() => navigate('/pay-bills')}
                  >
                    Pay Bills
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<AccountBalance />}
                    onClick={() => navigate('/virtual-account')}
                  >
                    Activate Account
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Receipt />}
                    onClick={() => navigate('/transactions')}
                  >
                    View All
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              {transactions.length > 0 ? (
                <List dense>
                  {transactions.map((transaction) => (
                    <ListItem key={transaction._id} divider>
                      <ListItemIcon>
                        <Receipt color={transaction.type === 'deposit' ? 'success' : 'error'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={transaction.description}
                        secondary={`₦${transaction.amount?.toLocaleString()} • ${new Date(transaction.createdAt).toLocaleDateString()}`}
                      />
                      <Chip 
                        label={transaction.status} 
                        color={transaction.status === 'completed' ? 'success' : 'warning'}
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Complete Range of Solutions */}
      {!showSolutions && (
        <Box sx={{ mt: 6, mb: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ fontWeight: 700, px: 5, py: 1.5, borderRadius: 2, fontSize: '1.1rem' }}
            onClick={() => setShowSolutions(true)}
          >
            VIEW ALL
          </Button>
        </Box>
      )}
      {showSolutions && (
        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
            Complete Range of Banking Solutions
          </Typography>
          <Grid container spacing={3}>
            {/* Wallet */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => navigate('/wallet')}>
                <CardContent>
                  <AccountBalanceWallet sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Wallet</Typography>
                  <Typography variant="body2" color="text.secondary">Manage your wallet and view your balance.</Typography>
                </CardContent>
              </Card>
            </Grid>
            {/* Transfer */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => navigate('/transfer')}>
                <CardContent>
                  <AccountBalance sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Transfer</Typography>
                  <Typography variant="body2" color="text.secondary">Send money to any bank account easily.</Typography>
                </CardContent>
              </Card>
            </Grid>
            {/* Pay Bills */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => navigate('/pay-bills')}>
                <CardContent>
                  <Payment sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Pay Bills</Typography>
                  <Typography variant="body2" color="text.secondary">Pay utility bills, TV, electricity, and more.</Typography>
                </CardContent>
              </Card>
            </Grid>
            {/* Airtime/Data */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => navigate('/airtime')}>
                <CardContent>
                  <Receipt sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Airtime/Data</Typography>
                  <Typography variant="body2" color="text.secondary">Buy airtime and data for any network.</Typography>
                </CardContent>
              </Card>
            </Grid>
            {/* Transactions */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => navigate('/transactions')}>
                <CardContent>
                  <Assessment sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Transactions</Typography>
                  <Typography variant="body2" color="text.secondary">View your transaction history.</Typography>
                </CardContent>
              </Card>
            </Grid>
            {/* Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => navigate('/cards')}>
                <CardContent>
                  <CreditCard sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Cards</Typography>
                  <Typography variant="body2" color="text.secondary">Manage your virtual and physical cards.</Typography>
                </CardContent>
              </Card>
            </Grid>
            {/* KYC/Verification */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => navigate('/kyc')}>
                <CardContent>
                  <Person sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">KYC/Verification</Typography>
                  <Typography variant="body2" color="text.secondary">Complete your KYC and verification.</Typography>
                </CardContent>
              </Card>
            </Grid>
            {/* Support */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => navigate('/contact')}>
                <CardContent>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, mb: 1 }}>?</Avatar>
                  <Typography variant="h6">Support</Typography>
                  <Typography variant="body2" color="text.secondary">Contact support or get help.</Typography>
                </CardContent>
              </Card>
            </Grid>
            {/* Virtual Account */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => navigate('/virtual-account')}>
                <CardContent>
                  <AccountBalanceWallet sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Virtual Account</Typography>
                  <Typography variant="body2" color="text.secondary">Create and manage your virtual account.</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
}

export default Dashboard; 