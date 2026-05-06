import React, { useState, useRef, useEffect } from "react";
import { AiOutlineClose, AiOutlineSend } from "react-icons/ai";
import { BsRobot } from "react-icons/bs";
import { useSelector } from "react-redux";
import { apiConnector } from "../../services/apiconnector";
import { aiEndpoints } from "../../services/apis";
import { toast } from "react-hot-toast";

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([
        { role: "bot", text: "Need any help in any course? Then feel free to ask me!" }
    ]);
    const [loading, setLoading] = useState(false);
    const { token } = useSelector((state) => state.auth);
    const chatContainerRef = useRef(null);

    // Auto scroll to bottom
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, loading]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        if (!token) {
            toast.error("Please login to use the AI Assistant");
            return;
        }

        const userMessage = { role: "user", text: message };
        setChatHistory((prev) => [...prev, userMessage]);
        setMessage("");
        setLoading(true);

        try {
            const response = await apiConnector(
                "POST",
                aiEndpoints.ASK_AI_API,
                { message },
                { Authorization: `Bearer ${token}` }
            );

            if (response.data.success) {
                setChatHistory((prev) => [
                    ...prev,
                    { role: "bot", text: response.data.data }
                ]);
            }
        } catch (error) {
            console.error("AI Error:", error);
            toast.error("Something went wrong. Please try again.");
            setChatHistory((prev) => [
                ...prev,
                { role: "bot", text: "I'm having some trouble connecting right now. Please try again later!" }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[1000] font-inter">
            {/* Chat Bubble */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-50 text-richblack-900 shadow-lg transition-all duration-300 hover:scale-110"
                    title="Ask AI Assistant"
                >
                    <BsRobot size={30} />
                </button>
            )}

            {/* Chat Dialog */}
            {isOpen && (
                <div className="flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl bg-richblack-800 shadow-2xl border border-richblack-700 transition-all duration-300 sm:w-[400px]">
                    {/* Header */}
                    <div className="flex items-center justify-between bg-richblack-700 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-50 text-richblack-900">
                                <BsRobot size={22} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-richblack-5">StudyNotion AI</h3>
                                <p className="text-[10px] text-caribbeangreen-200">Online | Always here to help</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-richblack-200 hover:text-white"
                        >
                            <AiOutlineClose size={20} />
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-richblack-600"
                    >
                        {chatHistory.map((chat, index) => (
                            <div
                                key={index}
                                className={`mb-4 flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${chat.role === "user"
                                            ? "bg-yellow-50 text-richblack-900 rounded-tr-none"
                                            : "bg-richblack-700 text-richblack-5 rounded-tl-none"
                                        }`}
                                >
                                    {chat.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="mb-4 flex justify-start">
                                <div className="max-w-[80%] rounded-2xl bg-richblack-700 px-4 py-2 text-sm text-richblack-5 rounded-tl-none italic">
                                    AI is thinking...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="bg-richblack-900 p-4 border-t border-richblack-700">
                        <div className="flex items-center gap-2 rounded-full bg-richblack-800 px-4 py-2 border border-richblack-700">
                            <input
                                type="text"
                                placeholder="Ask me anything about your courses..."
                                className="w-full bg-transparent text-sm text-richblack-5 outline-none placeholder:text-richblack-400"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={loading || !message.trim()}
                                className={`${loading || !message.trim() ? "text-richblack-600" : "text-yellow-50 hover:scale-110"
                                    } transition-all duration-200`}
                            >
                                <AiOutlineSend size={20} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AIAssistant;
