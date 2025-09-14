import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper,
  Button,
  useTheme
} from '@mui/material';
import { Analytics, TrendingUp, Dashboard, Home } from '@mui/icons-material';

const Header = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isOnDashboard = location.pathname === '/dashboard';

  return (
    <Paper 
      elevation={0}
      sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        p: 4,
        mb: 4,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Analytics sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Web Analytics Dashboard
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            size="large"
            startIcon={isOnDashboard ? <Home /> : <Dashboard />}
            onClick={() => navigate(isOnDashboard ? '/' : '/dashboard')}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.3)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {isOnDashboard ? 'Home' : 'Dashboard'}
          </Button>
        </Box>
        <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600 }}>
          {isOnDashboard 
            ? 'Analyze your website performance with detailed insights and metrics.'
            : 'Track your website performance with powerful analytics. Add your website to start monitoring visitor behavior, traffic sources, and engagement metrics.'
          }
        </Typography>
      </Box>
      
      {/* Decorative elements */}
      <TrendingUp 
        sx={{ 
          position: 'absolute',
          right: 20,
          top: 20,
          fontSize: 120,
          opacity: 0.1,
          transform: 'rotate(15deg)'
        }} 
      />
      <Box
        sx={{
          position: 'absolute',
          right: -50,
          bottom: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
        }}
      />
    </Paper>
  );
};

export default Header;