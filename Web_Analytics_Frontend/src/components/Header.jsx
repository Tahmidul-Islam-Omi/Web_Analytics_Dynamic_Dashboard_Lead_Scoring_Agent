import React from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  useTheme
} from '@mui/material';
import { Analytics, TrendingUp } from '@mui/icons-material';

const Header = () => {
  const theme = useTheme();

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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Analytics sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Web Analytics Dashboard
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600 }}>
          Track your website performance with powerful analytics. 
          Add your website to start monitoring visitor behavior, traffic sources, and engagement metrics.
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