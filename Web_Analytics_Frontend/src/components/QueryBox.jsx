import React, { useState } from 'react';
import {
    Paper,
    Box,
    Typography,
    TextField,
    IconButton,
    Avatar,
    Chip,
    Divider,
    InputAdornment
} from '@mui/material';
import {
    Send,
    SmartToy
} from '@mui/icons-material';
import ChartRenderer from './ChartRenderer';

const QueryBox = () => {
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [currentResponse, setCurrentResponse] = useState(null);

    const quickQuestions = [
        { text: 'Find the top 5 pages by total number of page views. Show using DoughnutChart.' },
        { text: 'Give me in BarChart which pages have the longest view duration.' },
        { text: 'Give me in LineCharts which pages have the most click activity.' },
    ];

    const handleSubmitQuery = async () => {
        if (!inputValue.trim()) return;

        const question = inputValue;
        // Don't clear the input - keep the question there
        setIsTyping(true);

        try {
            // Send query to backend API
            const response = await fetch('http://127.0.0.1:8000/api/query/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: question,
                    site_id: null,
                    user_id: null
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Log the response for debugging
            console.log('Query API Response:', data);

            // Check if response contains chart data
            if (data.response && typeof data.response === 'object' && data.response.chart_type) {
                // Handle chart response
                setCurrentResponse({
                    type: 'chart',
                    chartType: data.response.chart_type,
                    chartData: data.response.chart_data
                });
            } else {
                // Handle text response
                setCurrentResponse({
                    type: 'text',
                    content: data.response || 'Thanks for your query'
                });
            }

        } catch (error) {
            console.error('Error submitting query:', error);
            setCurrentResponse({
                type: 'text',
                content: 'Sorry, I encountered an error processing your request. Please try again.'
            });
        } finally {
            setIsTyping(false);
        }
    };

    const handleQuickQuestion = (question) => {
        setInputValue(question);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSubmitQuery();
        }
    };

    return (
        <Paper
            elevation={2}
            sx={{
                height: '600px',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SmartToy sx={{ mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Dynamic DashBoard Assistant !!!
                    </Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                    Ask me anything about your website analytics
                </Typography>
            </Box>

            {/* Quick Questions */}
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Quick questions:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {quickQuestions.map((question, index) => (
                        <Chip
                            key={index}
                            label={question.text}
                            size="small"
                            variant="outlined"
                            clickable
                            onClick={() => handleQuickQuestion(question.text)}
                            sx={{ fontSize: '0.75rem' }}
                        />
                    ))}
                </Box>
            </Box>

            {/* Response Area */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 40, height: 40, mr: 2, bgcolor: 'secondary.main' }}>
                        <SmartToy />
                    </Avatar>
                    <Typography variant="h6" color="text.primary">
                        Assistant Response
                    </Typography>
                </Box>

                {/* Static Welcome Message */}
                <Paper
                    elevation={1}
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: 'primary.light',
                        color: 'white',
                        mb: 2
                    }}
                >
                    <Typography
                        variant="body1"
                        sx={{
                            lineHeight: 1.6
                        }}
                    >
                        Hi! I'm your Dynamic Dashboard Assistant. You can explore your website's performance—like visitor traffic, session trends, top pages, user journeys, and click interactions. I'll turn your questions into visual insights, and you can choose how to see them with a BarChart, DoughnutChart, LineChart, or ScatterChart.
                    </Typography>
                </Paper>

                {/* Dynamic Response Area */}
                {(currentResponse || isTyping) && (
                    <Paper
                        elevation={1}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            bgcolor: 'grey.50',
                            minHeight: '100px',
                            display: 'flex',
                            alignItems: isTyping ? 'center' : 'flex-start'
                        }}
                    >
                        {isTyping ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
                                <Typography variant="body1" color="text.secondary">
                                    🔍 Analyzing your data...
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{ width: '100%' }}>
                                {currentResponse.type === 'chart' ? (
                                    <ChartRenderer
                                        chartType={currentResponse.chartType}
                                        chartData={currentResponse.chartData}
                                    />
                                ) : (
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            whiteSpace: 'pre-line',
                                            wordBreak: 'break-word',
                                            lineHeight: 1.6
                                        }}
                                    >
                                        {currentResponse.content}
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Paper>
                )}
            </Box>

            <Divider />

            {/* Input */}
            <Box sx={{ p: 2 }}>
                <TextField
                    fullWidth
                    multiline
                    maxRows={3}
                    placeholder="Ask about your analytics..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    variant="outlined"
                    size="small"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handleSubmitQuery}
                                    disabled={!inputValue.trim() || isTyping}
                                    color="primary"
                                    size="small"
                                >
                                    <Send />
                                </IconButton>
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 2 }
                    }}
                />
            </Box>
        </Paper>
    );
};

export default QueryBox;