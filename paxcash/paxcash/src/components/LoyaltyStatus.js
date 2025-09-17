import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  LinearProgress, 
  Chip, 
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { 
  Star, 
  TrendingUp, 
  CheckCircle, 
  Schedule 
} from '@mui/icons-material';

function LoyaltyStatus({ userId, service = 'combined' }) {
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      fetchLoyaltyStatus();
    }
  }, [userId]);

  const fetchLoyaltyStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/loyalty/status/${userId}`);
      const data = await res.json();
      
      if (data.success) {
        setLoyaltyData(data.loyalty);
      } else {
        setError(data.message || 'Failed to fetch loyalty status');
      }
    } catch (err) {
      setError('Failed to fetch loyalty status');
      console.error('Loyalty status error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography variant="body2" sx={{ mt: 1 }}>Loading loyalty status...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!loyaltyData) return null;

  const getProgressValue = (current, threshold = 3) => {
    return Math.min((current / threshold) * 100, 100);
  };

  const getStatusColor = (isEligible) => {
    return isEligible ? 'success' : 'warning';
  };

  const getStatusIcon = (isEligible) => {
    return isEligible ? <CheckCircle /> : <Schedule />;
  };

  return (
    <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Star sx={{ mr: 1, fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Loyalty Status
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Combined Status */}
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {loyaltyData.combined.totalDailyPurchases}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                Purchases Today
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={getProgressValue(loyaltyData.combined.totalDailyPurchases)}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: loyaltyData.combined.isEligible ? '#4caf50' : '#ff9800'
                    }
                  }}
                />
                <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.8 }}>
                  {loyaltyData.combined.nextForCashback} more to unlock cashback
                </Typography>
              </Box>

              <Chip
                icon={getStatusIcon(loyaltyData.combined.isEligible)}
                label={loyaltyData.combined.isEligible ? 'Cashback Active!' : 'Earn Cashback'}
                color={getStatusColor(loyaltyData.combined.isEligible)}
                sx={{ 
                  fontWeight: 600,
                  backgroundColor: loyaltyData.combined.isEligible ? '#4caf50' : '#ff9800',
                  color: 'white'
                }}
              />
            </Box>
          </Grid>

          {/* Airtime Status */}
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                Airtime
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {loyaltyData.airtime.dailyPurchases}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                Purchases Today
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={getProgressValue(loyaltyData.airtime.dailyPurchases)}
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: loyaltyData.airtime.isEligible ? '#4caf50' : '#ff9800'
                    }
                  }}
                />
                <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.8 }}>
                  {loyaltyData.airtime.nextForCashback} more for cashback
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                {loyaltyData.airtime.message}
              </Typography>
            </Box>
          </Grid>

          {/* Data Status */}
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                Data
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {loyaltyData.data.dailyPurchases}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                Purchases Today
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={getProgressValue(loyaltyData.data.dailyPurchases)}
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: loyaltyData.data.isEligible ? '#4caf50' : '#ff9800'
                    }
                  }}
                />
                <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.8 }}>
                  {loyaltyData.data.nextForCashback} more for cashback
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                {loyaltyData.data.message}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Cashback Info */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 500 }}>
            💰 Get 2% cashback on your 3rd purchase onwards! Reset daily at midnight.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default LoyaltyStatus;



