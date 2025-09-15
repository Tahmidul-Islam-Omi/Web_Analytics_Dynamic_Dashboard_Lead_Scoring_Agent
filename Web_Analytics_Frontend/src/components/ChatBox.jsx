import React, { useState, useRef, useEffect } from 'react';
import {
    Paper,
    Box,
    Typography,
    TextField,
    IconButton,
    List,
    ListItem,
    Avatar,
    Chip,
    Divider,
    InputAdornment
} from '@mui/material';
import {
    Send,
    SmartToy,
    Person,
    TrendingUp,
    Visibility,
    Schedule,
    Help
} from '@mui/icons-material';

const ChatBox = () => {

    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            content: 'Hi! I’m your Dynamic Dashboard Assistant. You can explore your website’s performance—like visitor traffic, session trends, top pages, user journeys, and click interactions. I’ll turn your questions into visual insights, and you can choose how to see them with a BarChart, DoughnutChart, LineChart, or ScatterChart.',
            timestamp: new Date()
        }
    ]);

    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const quickQuestions = [
        { text: 'Find the top 5 pages by total number of page views. Show using DoughnutChart.'},
        { text: 'Give me in BarChart which pages have the longest view duration.' },
        { text: 'Give me in LineCharts which pages have the most click activity.' },
    ];

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = inputValue;
        setInputValue('');
        setIsTyping(true);

        try {
            // Send query to backend API
            const response = await fetch('http://127.0.0.1:8000/api/chat/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: currentInput,
                    site_id: null, // Could be passed from parent component
                    user_id: null  // Could be passed from parent component
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Log the response for debugging
            console.log('Chat API Response:', data);
            
            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: data.response || 'Query received successfully!',
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, botMessage]);
            
        } catch (error) {
            console.error('Error sending chat message:', error);
            
            const errorMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: 'Sorry, I encountered an error processing your request. Please try again.',
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, errorMessage]);
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
            handleSendMessage();
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
                            icon={question.icon}
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

            {/* Messages */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
                <List sx={{ p: 0 }}>
                    {messages.map((message) => (
                        <ListItem
                            key={message.id}
                            sx={{
                                display: 'flex',
                                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                                px: 1,
                                py: 0.5
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    maxWidth: '85%',
                                    flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        mx: 1,
                                        bgcolor: message.type === 'user' ? 'primary.main' : 'secondary.main'
                                    }}
                                >
                                    {message.type === 'user' ? <Person /> : <SmartToy />}
                                </Avatar>
                                <Paper
                                    elevation={1}
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: message.type === 'user' ? 'primary.light' : 'grey.100',
                                        color: message.type === 'user' ? 'white' : 'text.primary'
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            whiteSpace: 'pre-line',
                                            wordBreak: 'break-word'
                                        }}
                                    >
                                        {message.content}
                                    </Typography>
                                </Paper>
                            </Box>
                        </ListItem>
                    ))}

                    {isTyping && (
                        <ListItem sx={{ px: 1, py: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'secondary.main' }}>
                                    <SmartToy />
                                </Avatar>
                                <Paper elevation={1} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.100' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Analyzing your data...
                                    </Typography>
                                </Paper>
                            </Box>
                        </ListItem>
                    )}
                </List>
                <div ref={messagesEndRef} />
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
                                    onClick={handleSendMessage}
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

export default ChatBox;