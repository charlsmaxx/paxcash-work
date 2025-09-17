import React, { useEffect, useState } from 'react';
import { Button, Alert, Box } from '@mui/material';
import { NotificationsActive, NotificationsOff } from '@mui/icons-material';
import { 
  subscribeToPush, 
  unsubscribeFromPush, 
  isSubscribedLocally,
  getExistingSubscription
} from '../services/notificationService';

function EnableNotifications({ userId }) {
  const [subscribed, setSubscribed] = useState(isSubscribedLocally());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    // Check actual subscription
    (async () => {
      const sub = await getExistingSubscription();
      if (sub && !subscribed) setSubscribed(true);
    })();
  }, []);

  const handleEnable = async () => {
    try {
      setLoading(true);
      setError('');
      setInfo('');
      await subscribeToPush(userId);
      setSubscribed(true);
      setInfo('Notifications enabled. You will get cashback alerts.');
    } catch (e) {
      setError(e.message || 'Failed to enable notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    try {
      setLoading(true);
      setError('');
      setInfo('');
      await unsubscribeFromPush(userId);
      setSubscribed(false);
      setInfo('Notifications disabled.');
    } catch (e) {
      setError(e.message || 'Failed to disable notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
      {subscribed ? (
        <Button 
          variant="outlined" 
          color="secondary"
          size="small"
          onClick={handleDisable}
          disabled={loading}
          startIcon={<NotificationsOff />}
        >
          Disable Notifications
        </Button>
      ) : (
        <Button 
          variant="contained" 
          color="primary"
          size="small"
          onClick={handleEnable}
          disabled={loading}
          startIcon={<NotificationsActive />}
        >
          Enable Notifications
        </Button>
      )}
      {error && <Alert severity="error" sx={{ ml: 2 }}>{error}</Alert>}
      {info && <Alert severity="success" sx={{ ml: 2 }}>{info}</Alert>}
    </Box>
  );
}

export default EnableNotifications;


