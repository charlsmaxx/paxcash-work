import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  AttachMoney,
  History,
  Send
} from '@mui/icons-material';

const RevenueCollection = () => {
  const [revenueSummary, setRevenueSummary] = useState(null);
  const [uncollectedRevenue, setUncollectedRevenue] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [collectDialogOpen, setCollectDialogOpen] = useState(false);
  const [collectAmount, setCollectAmount] = useState('');
  const [collecting, setCollecting] = useState(false);

  const adminKey = localStorage.getItem('adminKey');

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const [summaryRes, uncollectedRes, collectionsRes] = await Promise.all([
        fetch('/api/admin/revenue/summary', {
          headers: { 'x-admin-key': adminKey }
        }),
        fetch('/api/admin/revenue/uncollected', {
          headers: { 'x-admin-key': adminKey }
        }),
        fetch('/api/admin/revenue/collections?limit=10', {
          headers: { 'x-admin-key': adminKey }
        })
      ]);

      const summary = await summaryRes.json();
      const uncollected = await uncollectedRes.json();
      const collectionsData = await collectionsRes.json();

      if (summary.success) setRevenueSummary(summary.summary);
      if (uncollected.success) setUncollectedRevenue(uncollected.uncollectedRevenue);
      if (collectionsData.success) setCollections(collectionsData.collections);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectRevenue = async () => {
    setCollecting(true);
    try {
      const response = await fetch('/api/admin/revenue/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey
        },
        body: JSON.stringify({
          amount: collectAmount ? parseFloat(collectAmount) : null
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Revenue collected successfully! Amount: ₦${result.collection.amount}`);
        setCollectDialogOpen(false);
        setCollectAmount('');
        fetchRevenueData(); // Refresh data
      } else {
        alert(`Collection failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Collection error:', error);
      alert('Collection failed. Please try again.');
    } finally {
      setCollecting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Revenue Collection
      </Typography>

      {/* Revenue Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUp color="primary" />
                <Typography variant="h6" ml={1}>
                  Total Generated
                </Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {revenueSummary ? formatCurrency(revenueSummary.totalRevenueGenerated) : '₦0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AttachMoney color="success" />
                <Typography variant="h6" ml={1}>
                  Collected
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {revenueSummary ? formatCurrency(revenueSummary.totalCollected) : '₦0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountBalance color="warning" />
                <Typography variant="h6" ml={1}>
                  Uncollected
                </Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {revenueSummary ? formatCurrency(revenueSummary.uncollected) : '₦0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Send color="info" />
                <Typography variant="h6" ml={1}>
                  Available
                </Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {revenueSummary ? formatCurrency(revenueSummary.availableForCollection) : '₦0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Collection Actions */}
      <Box mb={3}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Send />}
          onClick={() => setCollectDialogOpen(true)}
          disabled={!revenueSummary || revenueSummary.availableForCollection <= 0}
          size="large"
        >
          Collect Revenue
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<History />}
          onClick={fetchRevenueData}
          sx={{ ml: 2 }}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Uncollected Revenue Details */}
      {uncollectedRevenue && uncollectedRevenue.totalAmount > 0 && (
        <Card mb={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Uncollected Revenue Details
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {uncollectedRevenue.transactionCount} transactions totaling {formatCurrency(uncollectedRevenue.totalAmount)}
            </Typography>
            <Chip 
              label={`${uncollectedRevenue.transactionCount} transactions`} 
              color="warning" 
              variant="outlined" 
            />
          </CardContent>
        </Card>
      )}

      {/* Collection History */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Collection History
          </Typography>
          {collections.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {collections.map((collection, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatDate(collection.createdAt)}</TableCell>
                      <TableCell>{formatCurrency(Math.abs(collection.amount))}</TableCell>
                      <TableCell>{collection.reference}</TableCell>
                      <TableCell>
                        <Chip 
                          label={collection.status} 
                          color={collection.status === 'completed' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary">
              No collections yet
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Collection Dialog */}
      <Dialog open={collectDialogOpen} onClose={() => setCollectDialogOpen(false)}>
        <DialogTitle>Collect Revenue</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Available for collection: {revenueSummary ? formatCurrency(revenueSummary.availableForCollection) : '₦0'}
          </Typography>
          <TextField
            label="Amount to collect (leave empty for all)"
            type="number"
            value={collectAmount}
            onChange={(e) => setCollectAmount(e.target.value)}
            fullWidth
            margin="normal"
            helperText="Leave empty to collect all available revenue"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCollectDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCollectRevenue} 
            variant="contained"
            disabled={collecting}
            startIcon={collecting ? <CircularProgress size={20} /> : <Send />}
          >
            {collecting ? 'Collecting...' : 'Collect'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RevenueCollection;

