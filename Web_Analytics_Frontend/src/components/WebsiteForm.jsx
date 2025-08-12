import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent,
  Fade,
  CircularProgress,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Add,
  Language,
  CheckCircle,
  Code,
  Visibility,
  Speed,
  ContentCopy,
  Info
} from '@mui/icons-material';
import { isValidUrl, formatUrl, extractDomain } from '../utils/validation';
import {
  FORM_VALIDATION,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  TRACKING_SCRIPT_URL
} from '../constants/config';

const WebsiteForm = () => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [siteName, setSiteName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setWebsiteUrl(url);

    // Auto-generate site name from domain if empty
    if (!siteName && url) {
      const domain = extractDomain(formatUrl(url));
      if (domain) {
        setSiteName(domain.replace('www.', ''));
      }
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!websiteUrl.trim()) {
      setError(FORM_VALIDATION.URL_REQUIRED);
      return;
    }

    const formattedUrl = formatUrl(websiteUrl);
    if (!isValidUrl(formattedUrl)) {
      setError(FORM_VALIDATION.URL_INVALID);
      return;
    }

    if (!siteName.trim()) {
      setError(FORM_VALIDATION.SITE_NAME_REQUIRED);
      return;
    }

    if (siteName.trim().length < 2) {
      setError(FORM_VALIDATION.SITE_NAME_MIN_LENGTH);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Website added:', {
        url: formattedUrl,
        name: siteName.trim(),
        domain: extractDomain(formattedUrl),
        timestamp: new Date().toISOString()
      });

      setSuccess(true);
      setWebsiteUrl('');
      setSiteName('');

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: <Visibility />, title: 'Real-time Tracking', desc: 'Monitor visitors as they browse' },
    { icon: <Speed />, title: 'Performance Metrics', desc: 'Page load times and user experience' },
    { icon: <Language />, title: 'Global Analytics', desc: 'Worldwide visitor insights' }
  ];

  return (
    <Box>
      <Grid container spacing={4}>
        {/* Main Form */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 3,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Language sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Add Your Website
              </Typography>
            </Box>

            {success && (
              <Fade in={success}>
                <Alert
                  severity="success"
                  icon={<CheckCircle />}
                  sx={{ mb: 3, borderRadius: 2 }}
                >
                  Website added successfully! You can now start tracking analytics.
                </Alert>
              </Fade>
            )}

            {error && (
              <Alert
                severity="error"
                sx={{ mb: 3, borderRadius: 2 }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Website URL"
                placeholder="https://your-website.com"
                value={websiteUrl}
                onChange={handleUrlChange}
                sx={{ mb: 3 }}
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 2 },
                  startAdornment: (
                    <InputAdornment position="start">
                      <Language color="action" />
                    </InputAdornment>
                  )
                }}
                helperText="Enter the full URL including https:// (site name will be auto-generated)"
              />

              <TextField
                fullWidth
                label="Site Name"
                placeholder="My Awesome Website"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                sx={{ mb: 4 }}
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
                helperText="A friendly name to identify your website"
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <Add />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                {isLoading ? 'Adding Website...' : 'Add Website'}
              </Button>
            </Box>

            {/* Tracking Code Preview */}
            <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Code sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Tracking Code Preview
                  </Typography>
                </Box>
                <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                  <Button
                    size="small"
                    startIcon={<ContentCopy />}
                    onClick={() => copyToClipboard(`<script 
                      src="${TRACKING_SCRIPT_URL}" 
                      data-site-id="${siteName || 'your-site-name'}"
                        async>
                    </script>`)}
                    sx={{
                      textTransform: 'none',
                      color: copied ? 'success.main' : 'primary.main'
                    }}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </Tooltip>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add this code to your website's HTML head section:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#1e1e1e', borderRadius: 1, position: 'relative' }}>
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{
                    color: '#e6e6e6',
                    fontFamily: 'Monaco, Consolas, monospace',
                    fontSize: '0.85rem',
                    margin: 0,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {`<script 
  src="${TRACKING_SCRIPT_URL}" 
  data-site-id="${siteName || 'your-site-name'}"
  async>
</script>`}
                </Typography>
              </Paper>

              {siteName && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                  <Info sx={{ fontSize: 16, color: 'info.main', mr: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Your site ID: <strong>{siteName}</strong>
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Features Sidebar */}
        <Grid item xs={12} md={4}>
          <Box sx={{ position: 'sticky', top: 20 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              What You'll Get
            </Typography>

            {features.map((feature, index) => (
              <Card
                key={index}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: 'primary.light',
                        color: 'white',
                        mr: 2,
                        mt: 0.5
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.desc}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}

            <Box sx={{ mt: 3, p: 3, bgcolor: 'primary.light', borderRadius: 2, color: 'white' }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                🚀 Ready to Start?
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Add your website above and start getting valuable insights about your visitors!
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WebsiteForm;