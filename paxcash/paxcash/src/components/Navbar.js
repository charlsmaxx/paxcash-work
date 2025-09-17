import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Box, 
  Container, 
  Menu, 
  Typography,
  Paper,
  Grid,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Divider,
  Avatar
} from '@mui/material';
import { 
  KeyboardArrowDown,
  KeyboardArrowRight,
  Menu as MenuIcon,
  Payment,
  DataUsage,
  AccountBalance,
  AccountBalanceWallet,
  Assessment,
  CreditCard
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png'; // Ensure the file name matches exactly

function Navbar() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMouseEnter = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMouseLeave = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMobileSolutionsToggle = () => {
    setMobileSolutionsOpen(!mobileSolutionsOpen);
  };

  const handleMobileItemClick = (path) => {
    navigate(path);
    setMobileOpen(false);
    setMobileSolutionsOpen(false);
  };

  // Service data for dropdown
  const services = [
    {
      icon: <Payment sx={{ fontSize: 32, color: '#1976D2' }} />,
      title: 'Bill Payments',
      desc: 'Pay electricity bills, TV subs, utility bills and more from the comfort of your home at reduced price.',
      route: '/pay-bills',
    },
    {
      icon: <DataUsage sx={{ fontSize: 32, color: '#1976D2' }} />, 
      title: 'Airtime & Data',
      desc: 'Buy airtime recharge and data top-up for all major network operators at much cheaper rate.',
      route: '/airtime',
    },
    {
      icon: <AccountBalance sx={{ fontSize: 32, color: '#1976D2' }} />, 
      title: 'Bank Transfers',
      desc: 'Transfer or send money to any local bank account in Nigeria at a cheaper rate.',
      route: '/transfer',
    },
    {
      icon: <AccountBalanceWallet sx={{ fontSize: 32, color: '#1976D2' }} />, 
      title: 'Virtual Accounts',
      desc: 'Get a Nigeria bank account number to receive payments within seconds. No fees, no hidden charges.',
      route: '/virtual-account',
    },
    {
      icon: <Assessment sx={{ fontSize: 32, color: '#1976D2' }} />, 
      title: 'Financial Data',
      desc: "Access balance, statement & other financial data from banks to know your customer's financial status.",
      route: '/wallet',
    },
    {
      icon: <CreditCard sx={{ fontSize: 32, color: '#1976D2' }} />, 
      title: 'Virtual Cards',
      desc: 'Create and manage virtual Naira and Dollar cards for your local & international payments - powered by VISA & Verve.',
      route: '/cards',
    },
  ];

  // Mobile Drawer Content
  const drawer = (
    <Box sx={{ width: 280, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <img src={logo} alt="Paxcash Logo" style={{ height: 40, marginRight: 12 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976D2' }}>
          Paxcash
        </Typography>
      </Box>
      
      <List>
        <ListItem 
          component="button"
          onClick={() => handleMobileItemClick('/')}
          sx={{ borderRadius: 2, mb: 1, width: '100%', textAlign: 'left', border: 'none', background: 'none' }}
        >
          <ListItemText 
            primary="Home" 
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>

        <ListItem 
          component="button"
          onClick={handleMobileSolutionsToggle}
          sx={{ borderRadius: 2, mb: 1, width: '100%', textAlign: 'left', border: 'none', background: 'none' }}
        >
          <ListItemText 
            primary="Solutions" 
            primaryTypographyProps={{ fontWeight: 500 }}
          />
          {mobileSolutionsOpen ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
        </ListItem>

        <Collapse in={mobileSolutionsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {services.map((service, index) => (
              <ListItem 
                key={index}
                component="button"
                sx={{ pl: 4, py: 1, width: '100%', textAlign: 'left', border: 'none', background: 'none' }}
                onClick={() => handleMobileItemClick(service.route)}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
                  <Box sx={{ mt: 0.5 }}>
                    {service.icon}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1976D2', mb: 0.5 }}>
                      {service.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                      {service.desc}
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </Collapse>

        <ListItem 
          component="button"
          onClick={() => handleMobileItemClick('/about')}
          sx={{ borderRadius: 2, mb: 1, width: '100%', textAlign: 'left', border: 'none', background: 'none' }}
        >
          <ListItemText 
            primary="About" 
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>

        <ListItem 
          component="button"
          onClick={() => handleMobileItemClick('/pricing')}
          sx={{ borderRadius: 2, mb: 1, width: '100%', textAlign: 'left', border: 'none', background: 'none' }}
        >
          <ListItemText 
            primary="Pricing" 
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>

        <ListItem 
          component="button"
          onClick={() => handleMobileItemClick('/contact')}
          sx={{ borderRadius: 2, mb: 1, width: '100%', textAlign: 'left', border: 'none', background: 'none' }}
        >
          <ListItemText 
            primary="Contact" 
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>
      </List>

      <Divider sx={{ my: 3 }} />

      {isAuthenticated ? (
        <>
          <Button
            variant="outlined"
            fullWidth
            sx={{
              borderColor: '#1976d2',
              color: '#1976d2',
              py: 1.5,
              borderRadius: 2,
              fontWeight: 'bold',
              mb: 2,
              '&:hover': {
                borderColor: '#1565c0',
                bgcolor: 'rgba(25, 118, 210, 0.04)',
              },
            }}
            onClick={() => handleMobileItemClick('/dashboard')}
          >
            Dashboard
          </Button>
          <Button
            variant="contained"
            fullWidth
            sx={{
              bgcolor: '#f44336',
              color: 'white',
              py: 1.5,
              borderRadius: 2,
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#d32f2f',
              },
            }}
            onClick={() => {
              logout();
              handleMobileItemClick('/');
            }}
          >
            Logout
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="text"
            fullWidth
            sx={{
              color: '#666',
              py: 1.5,
              borderRadius: 2,
              fontWeight: 'bold',
              mb: 2,
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
            onClick={() => handleMobileItemClick('/login')}
          >
            Login
          </Button>
          <Button
            variant="contained"
            fullWidth
            sx={{
              bgcolor: '#1976d2',
              color: 'white',
              py: 1.5,
              borderRadius: 2,
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#1565c0',
              },
            }}
            onClick={() => handleMobileItemClick('/signup')}
          >
            Get Started
          </Button>
        </>
      )}
    </Box>
  );

  return (
    <AppBar position="sticky" sx={{ 
      bgcolor: 'white', 
      color: 'text.primary', 
      boxShadow: 1,
      top: 0,
      zIndex: 1100,
      backdropFilter: 'blur(10px)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
    }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo as a link to home */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
            component="a"
            href="/"
          >
            <img src={logo} alt="Paxcash Logo" style={{ height: 56, marginRight: 12 }} />
          </Box>

          {/* Desktop Navigation Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
            <Button 
              color="inherit" 
              sx={{ fontWeight: 500 }}
              onClick={() => navigate('/')}
            >
              Home
            </Button>
            <Button 
              color="inherit" 
              sx={{ fontWeight: 500 }}
              onClick={handleClick}
              onMouseEnter={handleMouseEnter}
              endIcon={<KeyboardArrowDown />}
            >
              Solutions
            </Button>
            <Button 
              color="inherit" 
              sx={{ fontWeight: 500 }}
              onClick={() => navigate('/about')}
            >
              About
            </Button>
            <Button 
              color="inherit" 
              sx={{ fontWeight: 500 }}
              onClick={() => navigate('/pricing')}
            >
              Pricing
            </Button>
            <Button 
              color="inherit" 
              sx={{ fontWeight: 500 }}
              onClick={() => navigate('/contact')}
            >
              Contact
            </Button>
          </Box>

          {/* Desktop Authentication Buttons */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    '&:hover': {
                      borderColor: '#1565c0',
                      bgcolor: 'rgba(25, 118, 210, 0.04)',
                    },
                  }}
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32, fontSize: '0.875rem' }}>
                    {user?.firstName?.charAt(0)}
                  </Avatar>
                  <Button
                    variant="text"
                    sx={{
                      color: '#666',
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                  >
                    Logout
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Button
                  variant="text"
                  sx={{
                    color: '#666',
                    fontWeight: 500,
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: '#1976d2',
                    color: 'white',
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    '&:hover': {
                      bgcolor: '#1565c0',
                    },
                  }}
                  onClick={() => navigate('/signup')}
                >
                  Get Started
                </Button>
              </>
            )}
          </Box>

          {/* Mobile Hamburger Menu */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ color: '#1976D2' }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      {/* Desktop Solutions Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onMouseLeave={handleMouseLeave}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 800,
            maxWidth: 1000,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(255,255,255,0.18)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))',
            backdropFilter: 'blur(10px)',
          }
        }}
        MenuListProps={{
          sx: { p: 3 }
        }}
      >
        <Grid container spacing={3}>
          {services.map((service, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(25, 118, 210, 0.1)',
                  background: 'rgba(255,255,255,0.7)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)',
                    background: 'rgba(255,255,255,0.9)',
                    border: '1px solid rgba(25, 118, 210, 0.2)',
                  }
                }}
                onClick={() => {
                  navigate(service.route);
                  handleClose();
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ mt: 0.5 }}>
                    {service.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#1976D2' }}>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                      {service.desc}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Menu>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            bgcolor: 'white',
            borderLeft: '1px solid rgba(0,0,0,0.12)'
          },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
}

export default Navbar; 