import React, { useState, useEffect } from 'react';
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

const DashboardSidebar = ({ selectedSite, onSiteChange }) => {
    const [websites, setWebsites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWebsites();
    }, []);

    const fetchWebsites = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/websites');
            const data = await response.json();

            if (data.status === 'success') {
                setWebsites(data.websites);
            }
        } catch (error) {
            console.error('Error fetching websites:', error);
        } finally {
            setLoading(false);
        }
    };



    const handleSiteChange = (event) => {
        onSiteChange(event.target.value);
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
                    <InputLabel id="site-select-label">
                        {loading ? 'Loading websites...' : 'Choose a website'}
                    </InputLabel>
                    <Select
                        labelId="site-select-label"
                        value={selectedSite || ''}
                        label={loading ? 'Loading websites...' : 'Choose a website'}
                        onChange={handleSiteChange}
                        sx={{ borderRadius: 2 }}
                        disabled={loading}
                    >
                        {websites.length === 0 && !loading ? (
                            <MenuItem disabled>
                                <Typography variant="body2" color="text.secondary">
                                    No websites found. Add a website first.
                                </Typography>
                            </MenuItem>
                        ) : (
                            websites.map((site) => (
                                <MenuItem key={site.site_id} value={site.site_id}>
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
                            ))
                        )}
                    </Select>
                </FormControl>

                {selectedSite && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Currently viewing analytics for:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            {websites.find(site => site.site_id === selectedSite)?.name}
                        </Typography>
                    </Box>
                )}
            </Paper>



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