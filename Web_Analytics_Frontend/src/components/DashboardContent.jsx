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
    const [topPages, setTopPages] = useState([]);
    const [recentSessions, setRecentSessions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedSiteId) {
            fetchMetrics();
            fetchTopPages();
            fetchRecentSessions();
        }
    }, [selectedSiteId]);

    const fetchMetrics = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://web-analytics-agent.onrender.com/api/analytics/${selectedSiteId}/metrics`);
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

    const fetchTopPages = async () => {
        try {
            const response = await fetch(`https://web-analytics-agent.onrender.com/api/analytics/${selectedSiteId}/top-pages`);
            const data = await response.json();

            if (data.status === 'success') {
                setTopPages(data.top_pages);
            }
        } catch (error) {
            console.error('Error fetching top pages:', error);
        }
    };

    const fetchRecentSessions = async () => {
        try {
            const response = await fetch(`https://web-analytics-agent.onrender.com/api/analytics/${selectedSiteId}/recent-sessions`);
            const data = await response.json();

            if (data.status === 'success') {
                setRecentSessions(data.recent_sessions);
            }
        } catch (error) {
            console.error('Error fetching recent sessions:', error);
        }
    };


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
            {selectedSiteId && (
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Top Pages
                    </Typography>

                    {topPages.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                            No page data available yet
                        </Typography>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {topPages.map((page, index) => (
                                <Box key={index}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {page.page}
                                            </Typography>
                                            {page.url && page.page !== page.url && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {page.url}
                                                </Typography>
                                            )}
                                        </Box>
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
                    )}
                </Paper>
            )}

            {/* Recent Sessions */}
            {selectedSiteId && (
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Recent Sessions
                    </Typography>

                    {recentSessions.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                            No session data available yet
                        </Typography>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Duration</TableCell>
                                        <TableCell>Pages</TableCell>
                                        <TableCell>Lead Score</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentSessions.map((session) => (
                                        <TableRow key={session.session_id} hover>
                                            <TableCell>{session.duration}</TableCell>
                                            <TableCell>{session.pages}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={session.lead_score}
                                                    color={
                                                        session.lead_score >= 80 ? 'success' :
                                                            session.lead_score >= 60 ? 'warning' : 'error'
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
                    )}
                </Paper>
            )}
        </Box>
    );
};

export default DashboardContent;