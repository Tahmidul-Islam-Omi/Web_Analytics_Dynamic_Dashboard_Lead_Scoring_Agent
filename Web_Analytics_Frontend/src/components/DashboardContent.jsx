import React, { useState, useEffect } from 'react';
import {
    Paper,
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    LinearProgress,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress
} from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    Visibility,
    Schedule,
    Language,
    People
} from '@mui/icons-material';

const DashboardContent = ({ selectedSiteId }) => {
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedSiteId) {
            fetchMetrics();
        }
    }, [selectedSiteId]);

    const fetchMetrics = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/analytics/${selectedSiteId}/metrics`);
            const data = await response.json();

            if (data.status === 'success') {
                const metricsData = [
                    {
                        title: 'Total Page Views',
                        value: data.metrics.total_page_views.toLocaleString(),
                        change: '+0%', // TODO: Calculate change from previous period
                        trend: 'up',
                        icon: <Visibility />,
                        color: 'primary'
                    },
                    {
                        title: 'Unique Visitors',
                        value: data.metrics.unique_visitors.toLocaleString(),
                        change: '+0%', // TODO: Calculate change from previous period
                        trend: 'up',
                        icon: <People />,
                        color: 'success'
                    },
                    {
                        title: 'Avg. Session Duration',
                        value: data.metrics.avg_session_duration,
                        change: '+0%', // TODO: Calculate change from previous period
                        trend: 'up',
                        icon: <Schedule />,
                        color: 'info'
                    },
                    {
                        title: 'Pages per Session',
                        value: data.metrics.pages_per_session.toString(),
                        change: '+0%', // TODO: Calculate change from previous period
                        trend: 'up',
                        icon: <Language />,
                        color: 'warning'
                    }
                ];
                setMetrics(metricsData);
            }
        } catch (error) {
            console.error('Error fetching metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    const topPages = [
        { page: '/home', views: 4521, percentage: 36 },
        { page: '/products', views: 2834, percentage: 23 },
        { page: '/about', views: 1923, percentage: 15 },
        { page: '/contact', views: 1456, percentage: 12 },
        { page: '/blog', views: 1809, percentage: 14 }
    ];

    const recentSessions = [
        { id: 1, location: 'New York, US', duration: '3m 45s', pages: 5, score: 85 },
        { id: 2, location: 'London, UK', duration: '2m 12s', pages: 3, score: 62 },
        { id: 3, location: 'Tokyo, JP', duration: '4m 33s', pages: 7, score: 94 },
        { id: 4, location: 'Berlin, DE', duration: '1m 58s', pages: 2, score: 45 },
        { id: 5, location: 'Sydney, AU', duration: '5m 21s', pages: 8, score: 98 }
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Metrics Cards */}
            {!selectedSiteId ? (
                <Paper elevation={2} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        Select a website to view analytics
                    </Typography>
                </Paper>
            ) : loading ? (
                <Paper elevation={2} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Loading analytics...
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={2}>
                    {metrics.map((metric, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                        <Box
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 2,
                                                bgcolor: `${metric.color}.light`,
                                                color: `${metric.color}.contrastText`
                                            }}
                                        >
                                            {metric.icon}
                                        </Box>
                                        <Chip
                                            icon={metric.trend === 'up' ? <TrendingUp /> : <TrendingDown />}
                                            label={metric.change}
                                            color={metric.trend === 'up' ? 'success' : 'error'}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>
                                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                                        {metric.value}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {metric.title}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Top Pages */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Top Pages
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {topPages.map((page, index) => (
                        <Box key={index}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {page.page}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {page.views.toLocaleString()} views
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={page.percentage}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: 'grey.200',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 4
                                    }
                                }}
                            />
                        </Box>
                    ))}
                </Box>
            </Paper>

            {/* Recent Sessions */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Recent Sessions
                </Typography>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Location</TableCell>
                                <TableCell>Duration</TableCell>
                                <TableCell>Pages</TableCell>
                                <TableCell>Lead Score</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {recentSessions.map((session) => (
                                <TableRow key={session.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {session.location}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{session.duration}</TableCell>
                                    <TableCell>{session.pages}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={session.score}
                                            color={
                                                session.score >= 80 ? 'success' :
                                                    session.score >= 60 ? 'warning' : 'error'
                                            }
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default DashboardContent;