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
            content: 'Hello! I\'m your analytics assistant. Ask me anything about your website performance, metrics, or how to improve your analytics.',
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
        { text: 'Show top pages', icon: <TrendingUp /> },
        { text: 'Visitor trends', icon: <Visibility /> },
        { text: 'Session duration', icon: <Schedule /> },
        { text: 'Help me improve', icon: <Help /> }
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
        setInputValue('');
        setIsTyping(true);

        // Simulate bot response
        setTimeout(() => {
            const botResponse = generateBotResponse(inputValue);
            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: botResponse,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const generateBotResponse = (query) => {
        const lowerQuery = query.toLowerCase();
        
        if (lowerQuery.includes('top pages') || lowerQuery.includes('popular pages')) {
            return 'Based on your analytics, your top performing pages are:\n\n1. /home (4,521 views)\n2. /products (2,834 views)\n3. /about (1,923 views)\n\nYour homepage is performing exceptionally well!';
        }
        
        if (lowerQuery.includes('visitor') || lowerQuery.includes('traffic')) {
            return 'Your website has received 3,421 unique visitors this month, which is an 8.2% increase from last month. Peak traffic occurs between 2-4 PM on weekdays.';
        }
        
        if (lowerQuery.includes('session') || lowerQuery.includes('duration')) {
            return 'Your average session duration is 2 minutes and 34 seconds. Users typically view 3.7 pages per session. Consider adding more engaging content to increase session time.';
        }
        
        if (lowerQuery.includes('improve') || lowerQuery.includes('optimize')) {
            return 'Here are some suggestions to improve your analytics:\n\n• Add more engaging content to increase session duration\n• Optimize your top pages for better conversion\n• Implement A/B testing for key pages\n• Focus on mobile optimization';
        }
        
        if (lowerQuery.includes('lead score') || lowerQuery.includes('scoring')) {
            return 'Your lead scoring system tracks user engagement. Current average score is 72/100. High-scoring users (80+) typically view 5+ pages and spend 4+ minutes on site.';
        }
        
        return 'I can help you with analytics insights, performance metrics, visitor behavior, and optimization suggestions. Try asking about your top pages, visitor trends, or how to improve your website performance!';
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
                        Analytics Assistant
                    </Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                    Ask me about your website analytics
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