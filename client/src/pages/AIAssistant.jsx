import { useState, useRef, useEffect } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";
import ReactMarkdown from "react-markdown";
import logo from "../assets/ai-logo.png";

export default function AIAssistant() {
    const [messages, setMessages] = useState([
        { role: "ai", text: "Hello! I am your Limitly AI finance assistant. I have access to your recent expenses. How can I help you save money today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const { data } = await api.post("/ai/chat", { message: userMessage.text });
            const aiMessage = { role: "ai", text: data.response };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error("AI Chat Error:", error);
            const msg = error.response?.data?.message || "Sorry, I had trouble connecting to the financial brain.";
            const errorMessage = { role: "ai", text: `Error: ${msg}` };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex flex-col items-center justify-center p-4 min-h-[calc(100vh-140px)]">
                <div className="text-center mb-6">
                    <img src={logo} alt="Limitly AI Logo" className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-white drop-shadow-2xl hover:scale-110 transition-transform object-cover" />
                    <h2 className="text-3xl font-bold text-[#FFFBFA] mb-2">Limitly AI Advisor</h2>
                    <p className="text-gray-400">Personalized financial insights powered by Gemini</p>
                </div>

                <Card className="w-full max-w-3xl h-[600px] flex flex-col overflow-hidden !p-0 bg-opacity-90 backdrop-blur-xl border border-white/10 shadow-2xl">
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] p-4 rounded-2xl ${msg.role === "user"
                                        ? "bg-gradient-to-r from-[#6C63FF] to-[#FF6B6B] text-white rounded-br-none shadow-lg"
                                        : "bg-[#F0F2F5] text-[#03012C] rounded-bl-none shadow-sm"
                                        }`}
                                >
                                    <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-strong:text-current font-medium">
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-[#F0F2F5] p-4 rounded-2xl rounded-bl-none animate-pulse">
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white/5 border-t border-gray-100/10">
                        <form onSubmit={handleSend} className="flex gap-3">
                            <Input
                                placeholder="Ask about your expenses or general finance tips..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="bg-[#F0F2F5] border-none focus:ring-2 ring-[#6C63FF]/50 !mb-0 h-12"
                            />
                            <Button type="submit" disabled={loading} className="px-8 h-12 flex items-center justify-center">
                                {loading ? "..." : "Send"}
                            </Button>
                        </form>
                    </div>
                </Card>
            </div>
        </Layout>
    );
}
