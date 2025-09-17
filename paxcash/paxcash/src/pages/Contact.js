import React from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Grid,
  Card,
  CardContent,
  TextField,
  Paper
} from '@mui/material';
import { 
  Email, 
  Phone, 
  LocationOn,
  Support,
  Send
} from '@mui/icons-material';
import logo from '../assets/logo.png';

function Contact() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitMessage, setSubmitMessage] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage(result.message);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitMessage(result.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      {/* Hero Section with Background */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                mb: 3,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Welcome to Our Help Desk
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                maxWidth: 800, 
                mx: 'auto', 
                lineHeight: 1.6,
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              We're here to help you every step of the way. Whether you have questions about our services, 
              need technical support, or want to share feedback, our dedicated team is ready to assist you 
              with a warm, friendly approach.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Contact Information Cards */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%', 
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
              }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Email sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Email Support
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Get in touch with our support team via email
                </Typography>
                <Typography variant="body1" sx={{ color: '#1976d2', fontWeight: 600 }}>
                  support@paxcash.com
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%', 
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
              }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Phone sx={{ fontSize: 48, color: '#00bfa5', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Phone Support
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Call us directly for immediate assistance
                </Typography>
                <Typography variant="body1" sx={{ color: '#00bfa5', fontWeight: 600 }}>
                  +234 800 PAXCASH
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%', 
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
              }
            }}>
              <CardContent sx={{ p: 4 }}>
                <LocationOn sx={{ fontSize: 48, color: '#ff6b35', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Office Location
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Visit our office for in-person support
                </Typography>
                <Typography variant="body1" sx={{ color: '#ff6b35', fontWeight: 600 }}>
                  Lagos, Nigeria
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Contact Form */}
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                Send Us a Message
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
                Have a question or need assistance? Fill out the form below and we'll get back to you 
                as soon as possible. Our team typically responds within 24 hours during business days.
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Support sx={{ fontSize: 32, color: '#1976d2', mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    24/7 Customer Support
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    We're here to help you anytime, anywhere
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Message"
                      name="message"
                      multiline
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      variant="outlined"
                      placeholder="Tell us how we can help you..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      fullWidth
                      startIcon={<Send />}
                      disabled={isSubmitting}
                      sx={{ 
                        fontWeight: 600, 
                        py: 1.5,
                        fontSize: '1.1rem'
                      }}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Grid>
                  {submitMessage && (
                    <Grid item xs={12}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 1, 
                        bgcolor: submitMessage.includes('successfully') ? '#e8f5e8' : '#ffebee',
                        color: submitMessage.includes('successfully') ? '#2e7d32' : '#c62828',
                        textAlign: 'center'
                      }}>
                        {submitMessage}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* FAQ Section */}
      <Box sx={{ bgcolor: '#f8f9fa', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom sx={{ mb: 6, fontWeight: 700 }}>
            Frequently Asked Questions
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  How do I create a Paxcash account?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Simply download our mobile app from the App Store or Google Play Store, 
                  and follow the registration process. You'll need a valid phone number and email address.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  What are your support hours?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our customer support team is available 24/7 to assist you with any questions 
                  or issues you may have with our services.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  How secure is my money with Paxcash?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We use bank-level security and encryption to protect your funds. 
                  Your money is safe and secure with our advanced fraud protection systems.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Can I use Paxcash for business transactions?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Yes! We offer specialized business accounts with additional features 
                  designed to meet your business payment and banking needs.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer Section */}
      <Box sx={{ bgcolor: '#1a1a1a', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Logo and Company Info */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <img src={logo} alt="Paxcash Logo" style={{ height: 40, marginRight: 12 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                  Paxcash
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 2, lineHeight: 1.6 }}>
                Nigeria's leading fintech platform, providing secure, fast, and affordable banking solutions to millions of users across Africa.
              </Typography>
            </Grid>

            {/* Products Section */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Products
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ color: '#b0b0b0', cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Paxcash Business
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0', cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Paxcash Personal
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0', cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Paxcash API
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0', cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Paxcash POS
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0', cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Paxcash Card
                </Typography>
              </Box>
            </Grid>

            {/* Company Section */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Company
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ color: '#b0b0b0', cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  About Us
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0', cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Careers
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0', cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Press
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0', cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Blog
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0', cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Partners
                </Typography>
              </Box>
            </Grid>

            {/* Support Section */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Support
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ color: '#b0b0b0', cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Help Center
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0', cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Contact Us
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0', cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Privacy Policy
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0', cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Terms of Service
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0', cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Security
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Bottom Section */}
          <Box sx={{ borderTop: '1px solid #333', mt: 4, pt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
              © 2024 Paxcash. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" sx={{ color: '#b0b0b0', cursor: 'pointer', '&:hover': { color: 'white' } }}>
                Privacy Policy
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0', cursor: 'pointer', '&:hover': { color: 'white' } }}>
                Terms of Service
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Contact; 