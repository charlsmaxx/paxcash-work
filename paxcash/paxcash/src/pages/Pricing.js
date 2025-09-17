import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Box, 
  Chip, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Switch,
  Fade
} from '@mui/material';
import { 
  CheckCircle, 
  Payment, 
  DataUsage, 
  AccountBalance, 
  AccountBalanceWallet, 
  Security,
  Support,
  Speed
} from '@mui/icons-material';

function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  const services = [
    {
      icon: <Payment sx={{ fontSize: 32, color: '#764ba2' }} />,
      title: 'Bill Payments',
      description: 'Pay electricity, TV subscriptions, and utility bills',
      features: [
        'All major billers supported',
        'Instant payment confirmation',
        'Payment history tracking',
        'Scheduled payments'
      ],
      pricing: {
        monthly: 'Free',
        annual: 'Free',
        note: 'No fees for bill payments'
      }
    },
    {
      icon: <DataUsage sx={{ fontSize: 32, color: '#764ba2' }} />,
      title: 'Airtime & Data',
      description: 'Buy airtime and data bundles for all networks',
      features: [
        'All major networks (MTN, Airtel, Glo, 9mobile)',
        'Instant delivery',
        'Bulk purchase discounts',
        'Data rollover options'
      ],
      pricing: {
        monthly: '2% discount',
        annual: '5% discount',
        note: 'On all airtime and data purchases'
      }
    },
    {
      icon: <AccountBalance sx={{ fontSize: 32, color: '#764ba2' }} />,
      title: 'Bank Transfers',
      description: 'Send money to any Nigerian bank account',
      features: [
        'All Nigerian banks supported',
        'Instant transfers',
        'Transfer history',
        'Bulk transfer options'
      ],
      pricing: {
        monthly: '₦25 per transfer',
        annual: '₦20 per transfer',
        note: 'Flat fee regardless of amount'
      }
    },
    {
      icon: <AccountBalanceWallet sx={{ fontSize: 32, color: '#764ba2' }} />,
      title: 'Virtual Accounts',
      description: 'Get instant bank account numbers',
      features: [
        'Instant account creation',
        'Real bank account numbers',
        'Webhook notifications',
        'Account verification'
      ],
      pricing: {
        monthly: 'Free',
        annual: 'Free',
        note: 'No setup or maintenance fees'
      }
    }
  ];

  const plans = [
    {
      name: 'Basic',
      price: { monthly: 'Free', annual: 'Free' },
      description: 'Perfect for personal use',
      features: [
        'Up to 10 transactions per month',
        'Basic bill payments',
        'Airtime & data purchases',
        'Virtual account creation',
        'Email support'
      ],
      limitations: [
        'Limited to ₦50,000 per transaction',
        'No priority support',
        'Basic transaction history'
      ],
      buttonText: 'Get Started Free',
      buttonVariant: 'outlined',
      popular: false
    },
    {
      name: 'Pro',
      price: { monthly: '₦2,500', annual: '₦25,000' },
      description: 'Ideal for small businesses',
      features: [
        'Unlimited transactions',
        'All bill payment features',
        'Bulk airtime & data',
        'Advanced transfer options',
        'Priority support',
        'Transaction analytics',
        'API access',
        'Webhook notifications'
      ],
      limitations: [],
      buttonText: 'Upgrade to Pro',
      buttonVariant: 'contained',
      popular: true
    },
    {
      name: 'Enterprise',
      price: { monthly: 'Custom', annual: 'Custom' },
      description: 'For large businesses and fintechs',
      features: [
        'Everything in Pro',
        'Dedicated account manager',
        'Custom integrations',
        'White-label solutions',
        'Advanced security features',
        '24/7 phone support',
        'SLA guarantees',
        'Custom pricing'
      ],
      limitations: [],
      buttonText: 'Contact Sales',
      buttonVariant: 'outlined',
      popular: false
    }
  ];

  const faqs = [
    {
      question: 'Are there any hidden fees?',
      answer: 'No hidden fees. All our pricing is transparent and clearly displayed. You only pay for what you use.'
    },
    {
      question: 'Can I change my plan anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major payment methods including bank transfers, cards, and mobile money.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes, our Basic plan is completely free forever. You can also try Pro features with a 14-day free trial.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 30-day money-back guarantee for all paid plans if you\'re not satisfied.'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: '#1a365d' }}>
          Simple, Transparent Pricing
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4, maxWidth: 600, mx: 'auto' }}>
          Choose the perfect plan for your needs. No hidden fees, no surprises.
        </Typography>
        
        {/* Annual/Monthly Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
          <Typography variant="body1" sx={{ mr: 2, color: !isAnnual ? '#764ba2' : 'text.secondary' }}>
            Monthly
          </Typography>
          <Switch
            checked={isAnnual}
            onChange={(e) => setIsAnnual(e.target.checked)}
            sx={{
              '& .MuiSwitch-thumb': {
                backgroundColor: '#764ba2',
              },
              '& .MuiSwitch-track': {
                backgroundColor: '#764ba2',
              },
            }}
          />
          <Typography variant="body1" sx={{ ml: 2, color: isAnnual ? '#764ba2' : 'text.secondary' }}>
            Annual
          </Typography>
          {isAnnual && (
            <Chip 
              label="Save 20%" 
              color="success" 
              size="small" 
              sx={{ ml: 2 }}
            />
          )}
        </Box>
      </Box>

      {/* Pricing Cards */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        {plans.map((plan, index) => (
          <Grid item xs={12} md={4} key={plan.name}>
            <Fade in timeout={300 + index * 100}>
              <Card 
                sx={{ 
                  height: '100%', 
                  position: 'relative',
                  border: plan.popular ? '2px solid #764ba2' : '1px solid #e0e0e0',
                  boxShadow: plan.popular ? '0 8px 32px rgba(118, 75, 162, 0.2)' : '0 4px 16px rgba(0,0,0,0.1)',
                  transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s ease'
                }}
              >
                {plan.popular && (
                  <Chip
                    label="Most Popular"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontWeight: 600
                    }}
                  />
                )}
                
                <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#764ba2', mb: 1 }}>
                      {isAnnual ? plan.price.annual : plan.price.monthly}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {isAnnual && plan.name !== 'Enterprise' ? 'per year' : plan.name !== 'Enterprise' ? 'per month' : ''}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
                      {plan.description}
                    </Typography>
                  </Box>

                  <List sx={{ flexGrow: 1, mb: 3 }}>
                    {plan.features.map((feature, featureIndex) => (
                      <ListItem key={featureIndex} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature}
                          primaryTypographyProps={{ fontSize: '0.9rem' }}
                        />
                      </ListItem>
                    ))}
                    {plan.limitations.map((limitation, limitIndex) => (
                      <ListItem key={limitIndex} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Typography sx={{ color: 'text.disabled', fontSize: 20 }}>×</Typography>
                        </ListItemIcon>
                        <ListItemText 
                          primary={limitation}
                          primaryTypographyProps={{ 
                            fontSize: '0.9rem', 
                            color: 'text.disabled' 
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    variant={plan.buttonVariant}
                    fullWidth
                    size="large"
                    sx={{
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      borderRadius: 2,
                      ...(plan.popular && {
                        background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
                        color: 'white',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #5a3a7a 30%, #5a6fd8 90%)',
                        }
                      })
                    }}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {/* Service Pricing */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 6, color: '#1a365d' }}>
          Service Pricing
        </Typography>
        
        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ height: '100%', p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {service.icon}
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {service.description}
                    </Typography>
                  </Box>
                </Box>
                
                <List dense>
                  {service.features.map((feature, featureIndex) => (
                    <ListItem key={featureIndex} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <CheckCircle sx={{ color: '#4caf50', fontSize: 16 }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={feature}
                        primaryTypographyProps={{ fontSize: '0.85rem' }}
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#764ba2' }}>
                    {isAnnual ? service.pricing.annual : service.pricing.monthly}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {service.pricing.note}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Features Comparison */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 6, color: '#1a365d' }}>
          Why Choose PaxCash?
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Security sx={{ fontSize: 48, color: '#764ba2', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Bank-Level Security
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Your money and data are protected with enterprise-grade security and encryption.
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Speed sx={{ fontSize: 48, color: '#764ba2', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Lightning Fast
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Process transactions in seconds, not minutes. Get instant confirmations.
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Support sx={{ fontSize: 48, color: '#764ba2', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                24/7 Support
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Our support team is always ready to help you with any questions or issues.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 6, color: '#1a365d' }}>
          Frequently Asked Questions
        </Typography>
        
        <Grid container spacing={3}>
          {faqs.map((faq, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1a365d' }}>
                  {faq.question}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {faq.answer}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* CTA Section */}
      <Paper 
        sx={{ 
          p: 6, 
          textAlign: 'center', 
          background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
          color: 'white',
          borderRadius: 3
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Ready to Get Started?
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
          Join thousands of users who trust PaxCash for their financial needs
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{
            py: 2,
            px: 4,
            fontSize: '1.1rem',
            fontWeight: 600,
            backgroundColor: 'white',
            color: '#764ba2',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.9)',
            }
          }}
        >
          Start Free Today
        </Button>
      </Paper>
    </Container>
  );
}

export default Pricing;
