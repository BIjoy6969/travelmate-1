import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Minimize2, Maximize2, X, MessageCircle, Sparkles } from 'lucide-react';
import { chatService } from '../services/api';

const AIChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Hi! I can help you plan your trip or answer travel questions. Where do you want to go?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMessageText = inputValue; // Store inputValue before clearing
        setMessages(prev => [...prev, { role: 'user', text: userMessageText }]);
        setInputValue('');
        setIsLoading(true);

        // Format history for Gemini API
        // Filter out the initial welcome message if it's just local UI fluff,
        // or ensure the first message is 'user' if required by the API.
        // Also, `messages` here is the state BEFORE the current update (closure capture),
        // effectively excluding the current user message, which is what we want for 'history'.

        const historyForApi = messages
            .filter((msg, index) => {
                // Skip the very first message if it's the default welcome message from 'model'
                if (index === 0 && msg.role === 'model') return false;
                return true;
            })
            .map(msg => ({
                role: msg.role === 'client' ? 'user' : msg.role,
                parts: [{ text: msg.text }]
            }));

        try {
            const res = await chatService.sendMessage(userMessageText, historyForApi);
            const data = res.data;

            setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-[9990] p-4 rounded-full shadow-2xl transition-all duration-300 ${isOpen ? 'bg-red-500 rotate-90 text-white' : 'bg-brand-800 text-white hover:bg-brand-900 hover:scale-105'
                    }`}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-minimal-border flex flex-col overflow-hidden z-[9990] animate-in-faded">
                    {/* Header */}
                    <div className="p-4 bg-brand-900 text-white flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                            <Sparkles size={16} className="text-brand-100" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Travel Assistant</h3>
                            <div className="flex items-center gap-1.5 opacity-80">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                <span className="text-[10px] font-medium uppercase tracking-wider">Online</span>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-minimal-bg">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-minimal-muted text-white' : 'bg-brand-100 text-brand-800'
                                    }`}>
                                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                </div>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-brand-800 text-white rounded-tr-none'
                                    : 'bg-white border border-minimal-border rounded-tl-none shadow-sm'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center flex-shrink-0">
                                    <Bot size={14} />
                                </div>
                                <div className="bg-white border border-minimal-border rounded-2xl rounded-tl-none p-3 shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-minimal-border">
                        <div className="flex gap-2 relative">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Ask about places, flights, tips..."
                                className="input-minimal w-full pr-10"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-brand-800 hover:bg-brand-50 rounded-md disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChat;
