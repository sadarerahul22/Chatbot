// Updated: CORS fix deployed on backend
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState([]);
  const messagesEndRef = useRef(null);

  // Subtle floating particles (like medical/study theme)
  useEffect(() => {
    const interval = setInterval(() => {
      const newParticle = {
        id: Date.now(),
        x: Math.random() * 100,
        size: Math.random() * 8 + 4,
        delay: Math.random() * 2,
        duration: Math.random() * 4 + 3,
        emoji: ['📚', '💡', '✨', '🩺', '❤️', '🧠'][Math.floor(Math.random() * 6)]
      };
      setParticles(prev => [...prev, newParticle]);
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, 6000);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        message: input,
      });
      const botMsg = { role: 'bot', content: response.data.reply };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'Oops! Something went wrong. Please try again.';
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = `❌ ${error.response.data.detail}`;
      } else if (error.message) {
        errorMessage = `❌ ${error.message}`;
      }
      const errorMsg = { role: 'bot', content: errorMessage };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
      {/* Subtle Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute text-purple-300 opacity-30"
            style={{
              left: `${particle.x}%`,
              bottom: '-50px',
              fontSize: `${particle.size * 2}px`,
            }}
            initial={{ y: 0, opacity: 0, rotate: 0 }}
            animate={{
              y: -window.innerHeight - 100,
              opacity: [0, 0.5, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: "easeOut",
            }}
          >
            {particle.emoji}
          </motion.div>
        ))}
      </div>

      {/* Header - Warm & Professional */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
        className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-5 shadow-xl z-10"
      >
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            animate={{
              y: [0, -3, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="inline-block"
          >
            <span className="text-3xl">👩‍⚕️</span>
          </motion.div>
          <motion.h1
            className="text-3xl md:text-4xl font-bold mt-1"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            Welcome, Snehal! 🎯
          </motion.h1>
          <motion.p
            className="text-lg text-indigo-100 mt-1"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            I'm Chitti – your study companion for MBBS 📚
          </motion.p>
          <motion.div
            className="flex justify-center gap-3 mt-1 text-sm text-indigo-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span>💡 Ask anything</span>
            <span>•</span>
            <span>🩺 Medical expert</span>
            <span>•</span>
            <span>⚡ 24/7 available</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center items-center h-full text-center"
          >
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              💫
            </motion.div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Ready to learn, Snehal?
            </h2>
            <p className="text-gray-500 max-w-md">
              Ask me anything about your MBBS studies – from anatomy to clinical practice. I'm here to help you succeed! 🎓
            </p>
            <div className="flex gap-4 mt-4 text-sm text-gray-400">
              <span className="px-3 py-1 bg-purple-50 rounded-full">💊 Pharmacology</span>
              <span className="px-3 py-1 bg-pink-50 rounded-full">🧬 Anatomy</span>
              <span className="px-3 py-1 bg-indigo-50 rounded-full">❤️ Cardiology</span>
            </div>
          </motion.div>
        )}
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-2xl p-4 rounded-2xl shadow-lg ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-none'
                    : 'bg-white/90 backdrop-blur-sm text-gray-800 rounded-bl-none border border-purple-100'
                }`}
              >
                {msg.role === 'bot' && (
                  <div className="flex items-center gap-2 mb-1 text-purple-500 text-sm font-medium">
                    <span>🩺</span>
                    <span>Chitti</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">Study assistant</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                {msg.role === 'bot' && (
                  <motion.div
                    className="flex gap-1 mt-2 text-xs text-purple-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span>✨</span>
                    <span>Hope this helps!</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-purple-100">
              <div className="flex space-x-2">
                <motion.span
                  className="w-2.5 h-2.5 bg-purple-400 rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.span
                  className="w-2.5 h-2.5 bg-pink-400 rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.span
                  className="w-2.5 h-2.5 bg-indigo-400 rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Clean & Professional */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-lg p-4 border-t border-purple-100 z-10"
      >
        <div className="flex max-w-4xl mx-auto gap-3">
          <motion.input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask your MBBS question here..."
            className="flex-1 p-3.5 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all bg-white/90"
            disabled={loading}
            whileFocus={{ scale: 1.01 }}
          />
          <motion.button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="flex items-center gap-2">
              <span>Send</span>
              <span>→</span>
            </span>
          </motion.button>
        </div>
        <motion.div
          className="text-center text-xs text-gray-400 mt-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          Powered by AI • Always learning • Here for you, Snehal 💫
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Chat;