import React, { useState } from 'react';
import {
    Paper,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
    Divider,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    Language,
    Visibility,
    Schedule,
    TrendingUp,
    People,
    Mouse,
    Speed
} from '@mui/icons-material';

const DashboardSidebar = () => {
    const [selectedSite, setSelectedSite] = useState('');

    // Mock data for websites - in real app this would come from API
    const websites = [
        { id: 'site1', name: 'My Blog', url: 'https://myblog.com', status: 'active' },
        { id: 'site2', name: 'E-commerce Store', url: 'https://mystore.com', status: 'active' },
        { id: 'site3', name: 'Portfolio', url: 'https://myportfolio.com', status: 'inactive' }
    ];

    const quickStats = [
        { icon: <Visibility />, label: 'Page Views', value: '12,543', color: 'primary' },
        { icon: <People />, label: 'Visitors', value: '3,421', color: 'success' },
        { icon: <Schedule />, label: 'Avg. Session', value: '2m 34s', color: 'info' },
        { icon: <TrendingUp />, label: 'Bounce Rate', value: '34.2%', color: 'warning' }
    ];

    const handleSiteChange = (event) => {
        setSelectedSite(event.target.value);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Site Selector */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <Language sx={{ mr: 1, color: 'primary.main' }} />
                    Select Website
                </Typography>
                
                <FormControl fullWidth>
                    <InputLabel id="site-select-label">Choose a website</InputLabel>
                    <Select
                        labelId="site-select-label"
                        value={selectedSite}
                        label="Choose a website"
                        onChange={handleSiteChange}
                        sx={{ borderRadius: 2 }}
                    >
                        {websites.map((site) => (
                            <MenuItem key={site.id} value={site.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <Box>
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            {site.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {site.url}
                                        </Typography>
                                    </Box>
                                    <Chip 
                                        label={site.status} 
                                        size="small" 
                                        color={site.status === 'active' ? 'success' : 'default'}
                                        variant="outlined"
                                    />
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {selectedSite && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Currently viewing analytics for:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            {websites.find(site => site.id === selectedSite)?.name}
                        </Typography>
                    </Box>
                )}
            </Paper>

            {/* Quick Stats */}
            {selectedSite && (
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Quick Stats
                    </Typography>
                    
                    <List sx={{ p: 0 }}>
                        {quickStats.map((stat, index) => (
                            <React.Fragment key={index}>
                                <ListItem sx={{ px: 0, py: 1 }}>
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <Box
                                            sx={{
                                                p: 1,
                                                borderRadius: 1,
                                                bgcolor: `${stat.color}.light`,
                                                color: `${stat.color}.contrastText`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {stat.icon}
                                        </Box>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                {stat.value}
                                            </Typography>
                                        }
                                        secondary={stat.label}
                                    />
                                </ListItem>
                                {index < quickStats.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            )}

            {/* Analytics Features */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Analytics Features
                </Typography>
                
                <List sx={{ p: 0 }}>
                    {[
                        { icon: <Mouse />, label: 'Click Tracking', desc: 'Monitor user interactions' },
                        { icon: <Speed />, label: 'Performance', desc: 'Page load metrics' },
                        { icon: <TrendingUp />, label: 'Lead Scoring', desc: 'User engagement scoring' }
                    ].map((feature, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 1.5 }}>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                {feature.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {feature.label}
                                    </Typography>
                                }
                                secondary={feature.desc}
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Box>
    );
};

export default DashboardSidebar;