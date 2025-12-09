import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const AIChat = () => {
    const [messages, setMessages] = useState([
        { sender: 'ai', text: "Hello! I'm TravelMate AI. I can help you plan your trip based on your favorites and budget. Ask me anything!" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const USER_ID = 'test-user-1';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:1340/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: USER_ID, message: userMsg })
            });

            const data = await res.json();
            setMessages(prev => [...prev, { sender: 'ai', text: data.reply || "Sorry, I couldn't process that." }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { sender: 'ai', text: "I'm having trouble connecting to the travel grid (" + error.message + "). Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-100px)] flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-t-2xl shadow-lg flex items-center gap-3">
                <div className="bg-white p-2 rounded-full">
                    <Bot className="text-blue-600" size={24} />
                </div>
                <div>
                    <h1 className="text-white font-bold text-xl">Travel Assistant</h1>
                    <div className="text-blue-100 text-sm flex items-center gap-1">
                        <Sparkles size={12} /> Context-Aware Enabled
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-gray-50 border-x border-b rounded-b-2xl p-4 overflow-y-auto space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[80%] items-start gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-indigo-500'}`}>
                                {msg.sender === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
                            </div>
                            <div className={`p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 shadow-sm rounded-tl-none border'}`}>
                                {msg.text}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="mt-4 flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about flights, budget, or your saved trips..."
                    className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default AIChat;
