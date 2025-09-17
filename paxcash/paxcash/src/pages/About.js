import React from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Grid,
  Card,
  CardContent,
  Paper,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Security,
  Speed,
  AccountBalance,
  TrendingUp,
  People,
  VerifiedUser,
  CheckCircle,
  Payment,
  DataUsage,
  CreditCard,
  AccountBalanceWallet,
  Assessment
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

function About() {
  const navigate = useNavigate();

  // Company stats
  const stats = [
    { number: '2M+', label: 'Active Users', icon: <People sx={{ fontSize: 40, color: '#1976d2' }} /> },
    { number: '₦50B+', label: 'Transaction Volume', icon: <TrendingUp sx={{ fontSize: 40, color: '#00bfa5' }} /> },
    { number: '99.9%', label: 'Uptime Guarantee', icon: <VerifiedUser sx={{ fontSize: 40, color: '#ff6b35' }} /> },
    { number: '24/7', label: 'Customer Support', icon: <Security sx={{ fontSize: 40, color: '#9c27b0' }} /> }
  ];

  // Core values
  const coreValues = [
    {
      icon: <Security sx={{ fontSize: 48, color: '#1976d2' }} />,
      title: 'Security First',
      description: 'Bank-grade encryption and multi-layer security protocols protect every transaction and user data.'
    },
    {
      icon: <Speed sx={{ fontSize: 48, color: '#00bfa5' }} />,
      title: 'Lightning Fast',
      description: 'Real-time processing ensures instant transactions and immediate fund availability.'
    },
    {
      icon: <AccountBalance sx={{ fontSize: 48, color: '#ff6b35' }} />,
      title: 'Financial Inclusion',
      description: 'Democratizing banking services for everyone, regardless of location or economic status.'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 48, color: '#9c27b0' }} />,
      title: 'Innovation Driven',
      description: 'Continuously evolving technology to provide cutting-edge financial solutions.'
    }
  ];

  // Services overview
  const services = [
    {
      icon: <Payment sx={{ fontSize: 32, color: '#1976D2' }} />,
      title: 'Bill Payments',
      desc: 'Seamless utility and subscription payments with instant confirmation.'
    },
    {
      icon: <DataUsage sx={{ fontSize: 32, color: '#1976D2' }} />, 
      title: 'Airtime & Data',
      desc: 'Best rates for airtime and data purchases across all networks.',
    },
    {
      icon: <AccountBalance sx={{ fontSize: 32, color: '#1976D2' }} />, 
      title: 'Bank Transfers',
      desc: 'Instant transfers to any Nigerian bank account at competitive rates.',
    },
    {
      icon: <AccountBalanceWallet sx={{ fontSize: 32, color: '#1976D2' }} />, 
      title: 'Virtual Accounts',
      desc: 'Instant virtual account creation for seamless payment collection.',
    },
    {
      icon: <Assessment sx={{ fontSize: 32, color: '#1976D2' }} />, 
      title: 'Financial Data',
      desc: 'Comprehensive financial insights and analytics for better decision making.',
    },
    {
      icon: <CreditCard sx={{ fontSize: 32, color: '#1976D2' }} />, 
      title: 'Virtual Cards',
      desc: 'Secure virtual cards for local and international transactions.',
    },
  ];

  // Team members
  const teamMembers = [
    {
      name: 'David Okechukwu',
      role: 'Chief Executive Officer',
      avatar: 'DO',
      description: 'Former VP at Goldman Sachs with 15+ years in fintech innovation.'
    },
    {
      name: 'Sarah Johnson',
      role: 'Chief Technology Officer',
      avatar: 'SJ',
      description: 'Ex-Google engineer specializing in scalable financial systems.'
    },
    {
      name: 'Michael Chen',
      role: 'Chief Financial Officer',
      avatar: 'MC',
      description: 'Former Deloitte partner with expertise in financial regulations.'
    },
    {
      name: 'Aisha Hassan',
      role: 'Head of Product',
      avatar: 'AH',
      description: 'Product leader with experience at PayPal and Stripe.'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '80vh',
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
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip 
                label="Est. 2020" 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white', 
                  mb: 3,
                  fontWeight: 600
                }} 
              />
              <Typography 
                variant="h1" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  color: 'white', 
                  fontWeight: 800, 
                  lineHeight: 1.1,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                Revolutionizing<br />
                Digital Banking
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  mb: 4, 
                  lineHeight: 1.6,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                Paxcash is Nigeria's leading fintech platform, providing secure, fast, and affordable banking solutions to millions of users across Africa.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  sx={{ 
                    bgcolor: 'white', 
                    color: '#667eea', 
                    fontWeight: 600, 
                    px: 4,
                    py: 1.5,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                  }}
                  onClick={() => navigate('/signup')}
                >
                  Get Started
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  sx={{ 
                    borderColor: 'white', 
                    color: 'white', 
                    fontWeight: 600, 
                    px: 4,
                    py: 1.5,
                    '&:hover': { 
                      borderColor: 'white', 
                      bgcolor: 'rgba(255,255,255,0.1)' 
                    }
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
              <Box sx={{ 
                display: 'inline-block', 
                position: 'relative',
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: -20,
                  left: -20,
                  right: -20,
                  bottom: -20,
                  background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                  borderRadius: '50%',
                  zIndex: -1,
                }
              }}>
                <img 
                  src={logo} 
                  alt="Paxcash Logo" 
                  style={{ 
                    width: '300px', 
                    height: 'auto',
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
                  }} 
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ 
                textAlign: 'center', 
                p: 3, 
                height: '100%',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#1976d2', mb: 1 }}>
                    {stat.number}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Our Story Section */}
      <Box sx={{ bgcolor: '#f8f9fa', py: 10 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
                Our Story
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                Founded in 2020, Paxcash emerged from a simple yet powerful vision: to democratize financial services and make banking accessible to every Nigerian.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                What started as a small team of passionate fintech innovators has grown into Nigeria's most trusted digital banking platform. We recognized that traditional banking was failing millions of people - long queues, high fees, and limited accessibility were barriers to financial inclusion.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
                Today, Paxcash serves over 2 million users across Nigeria, processing billions of naira in transactions monthly. Our platform combines cutting-edge technology with deep understanding of local needs, creating a banking experience that's not just digital, but truly transformative.
              </Typography>
              <Button 
                variant="contained" 
                size="large" 
                sx={{ 
                  fontWeight: 600, 
                  px: 4, 
                  py: 1.5,
                  borderRadius: 2
                }}
              >
                Read Our Journey
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={6} sx={{ p: 4, borderRadius: 3, bgcolor: 'white' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1976d2' }}>
                  Our Mission
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                  To provide secure, affordable, and accessible financial services that empower individuals and businesses to achieve their financial goals.
                </Typography>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1976d2' }}>
                  Our Vision
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  To become Africa's leading digital banking platform, driving financial inclusion and economic growth across the continent.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Core Values Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 8, fontWeight: 700 }}>
          Our Core Values
        </Typography>
        <Grid container spacing={4}>
          {coreValues.map((value, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ 
                textAlign: 'center', 
                p: 4, 
                height: '100%',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(25, 118, 210, 0.1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(25, 118, 210, 0.15)',
                  border: '1px solid rgba(25, 118, 210, 0.3)'
                }
              }}>
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    {value.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1976d2' }}>
                    {value.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {value.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Banking System Section */}
      <Box sx={{ bgcolor: '#1a1a1a', color: 'white', py: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 8, fontWeight: 700 }}>
            Our Solid Banking System
          </Typography>
          <Typography variant="h6" textAlign="center" sx={{ mb: 8, color: 'rgba(255,255,255,0.8)', maxWidth: 800, mx: 'auto' }}>
            Built on enterprise-grade infrastructure with multiple layers of security, our banking system ensures your money is always safe and transactions are processed instantly.
          </Typography>
          
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: '#00bfa5' }}>
                Security & Compliance
              </Typography>
              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#00bfa5' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Bank-grade encryption (256-bit SSL)" 
                    secondary="All data is encrypted in transit and at rest"
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#00bfa5' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="CBN licensed and regulated" 
                    secondary="Full compliance with Nigerian banking regulations"
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#00bfa5' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Multi-factor authentication" 
                    secondary="Biometric, PIN, and OTP verification"
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#00bfa5' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Real-time fraud detection" 
                    secondary="AI-powered monitoring for suspicious activities"
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: '#00bfa5' }}>
                Technology Infrastructure
              </Typography>
              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#00bfa5' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Cloud-native architecture" 
                    secondary="Built on AWS with 99.99% uptime guarantee"
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#00bfa5' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Microservices architecture" 
                    secondary="Scalable and maintainable system design"
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#00bfa5' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Real-time processing" 
                    secondary="Instant transaction confirmation and settlement"
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#00bfa5' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="24/7 monitoring" 
                    secondary="Continuous system health and performance monitoring"
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services Overview */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 8, fontWeight: 700 }}>
          Comprehensive Banking Solutions
        </Typography>
        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  textAlign: 'center',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)',
                  }
                }}
              >
                <Box sx={{ mb: 3 }}>
                  {service.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1976d2' }}>
                  {service.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {service.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Leadership Team */}
      <Box sx={{ bgcolor: '#f8f9fa', py: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 8, fontWeight: 700 }}>
            Meet Our Leadership
          </Typography>
          <Grid container spacing={4}>
            {teamMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 3, 
                  height: '100%',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                  }
                }}>
                  <CardContent>
                    <Avatar 
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        mx: 'auto', 
                        mb: 2, 
                        bgcolor: '#1976d2',
                        fontSize: '1.5rem',
                        fontWeight: 600
                      }}
                    >
                      {member.avatar}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {member.name}
                    </Typography>
                    <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
                      {member.role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                      {member.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        color: 'white',
        py: 10 
      }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
            Ready to Experience the Future of Banking?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
            Join millions of Nigerians who trust Paxcash for their daily banking needs. Start your journey today.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large" 
              sx={{ 
                bgcolor: 'white', 
                color: '#1976d2', 
                fontWeight: 600, 
                px: 4,
                py: 1.5,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
              }}
                                onClick={() => navigate('/signup')}
            >
              Get Started Now
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              sx={{ 
                borderColor: 'white', 
                color: 'white', 
                fontWeight: 600, 
                px: 4,
                py: 1.5,
                '&:hover': { 
                  borderColor: 'white', 
                  bgcolor: 'rgba(255,255,255,0.1)' 
                }
              }}
              onClick={() => navigate('/contact')}
            >
              Contact Us
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default About; 