import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Tabs,
  Tab
} from '@mui/material';
import {
  TrendingUp,
  People,
  AttachMoney,
  Star,
  Assessment,
  Refresh,
  AccountBalance
} from '@mui/icons-material';
import RevenueCollection from '../components/RevenueCollection';

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState('30');
  const [adminKey, setAdminKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (authenticated) {
      fetchAnalytics();
    }
  }, [authenticated, dateRange]);

  const handleLogin = () => {
    if (adminKey) {
      setAuthenticated(true);
    } else {
      setError('Please enter admin key');
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/admin/loyalty/overview?days=${dateRange}`, {
        headers: {
          'x-admin-key': adminKey
        }
      });
      const data = await res.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        setError(data.message || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError('Failed to fetch analytics');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealtimeData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/loyalty/realtime', {
        headers: {
          'x-admin-key': adminKey
        }
      });
      const data = await res.json();
      
      if (data.success) {
        // Update real-time data in analytics
        setAnalytics(prev => ({
          ...prev,
          realtime: data.realtime
        }));
      }
    } catch (err) {
      console.error('Real-time data error:', err);
    }
  };

  if (!authenticated) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Admin Dashboard
          </Typography>
          <TextField
            fullWidth
            label="Admin Key"
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Button
            variant="contained"
            onClick={handleLogin}
            fullWidth
            size="large"
          >
            Login
          </Button>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading analytics...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchAnalytics}>
          Retry
        </Button>
      </Container>
    );
  }

  if (!analytics) return null;

  const { overview, serviceBreakdown, dailyBreakdown, topUsers, realtime } = analytics;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 90 days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchRealtimeData}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Loyalty Analytics" icon={<Assessment />} />
          <Tab label="Revenue Collection" icon={<AccountBalance />} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Assessment color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {overview.totalTransactions.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Transactions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoney color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    ₦{overview.totalVolume.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Volume
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Star color="warning" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    ₦{overview.totalCashbackGiven.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cashback Given
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp color="info" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {overview.cashbackRate.toFixed(2)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cashback Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Service Breakdown */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Service Breakdown
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Airtime</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {serviceBreakdown.airtime.transactions} transactions
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(serviceBreakdown.airtime.transactions / overview.totalTransactions) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary">
                  ₦{serviceBreakdown.airtime.volume.toLocaleString()} volume
                </Typography>
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Data</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {serviceBreakdown.data.transactions} transactions
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(serviceBreakdown.data.transactions / overview.totalTransactions) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary">
                  ₦{serviceBreakdown.data.volume.toLocaleString()} volume
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Real-time Stats
              </Typography>
              {realtime && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Today's Transactions</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {realtime.today.transactions}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Today's Volume</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      ₦{realtime.today.volume.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Active Users</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {realtime.today.activeUsers}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Eligible for Cashback</Typography>
                    <Chip
                      label={realtime.today.eligibleUsers}
                      color="success"
                      size="small"
                    />
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Users */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Top Users by Volume
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User ID</TableCell>
                  <TableCell align="right">Transactions</TableCell>
                  <TableCell align="right">Volume</TableCell>
                  <TableCell align="right">Cashback Earned</TableCell>
                  <TableCell align="right">Airtime</TableCell>
                  <TableCell align="right">Data</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topUsers.map((user, index) => (
                  <TableRow key={user.userId}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip
                          label={`#${index + 1}`}
                          size="small"
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                        {user.userId.substring(0, 8)}...
                      </Box>
                    </TableCell>
                    <TableCell align="right">{user.totalTransactions}</TableCell>
                    <TableCell align="right">₦{user.totalVolume.toLocaleString()}</TableCell>
                    <TableCell align="right">₦{user.cashbackEarned.toLocaleString()}</TableCell>
                    <TableCell align="right">{user.airtimeCount}</TableCell>
                    <TableCell align="right">{user.dataCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Daily Breakdown Chart */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Daily Transaction Trends
          </Typography>
          <Box sx={{ height: 300, overflow: 'auto' }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Airtime</TableCell>
                    <TableCell align="right">Data</TableCell>
                    <TableCell align="right">Volume</TableCell>
                    <TableCell align="right">Cashback</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dailyBreakdown.slice(-30).reverse().map((day) => (
                    <TableRow key={day.date}>
                      <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>
                      <TableCell align="right">{day.total}</TableCell>
                      <TableCell align="right">{day.airtime}</TableCell>
                      <TableCell align="right">{day.data}</TableCell>
                      <TableCell align="right">₦{day.volume.toLocaleString()}</TableCell>
                      <TableCell align="right">₦{day.cashback.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </CardContent>
      </Card>
        </>
      )}

      {activeTab === 1 && (
        <RevenueCollection />
      )}
    </Container>
  );
}

export default AdminDashboard;


