import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, BarChart2 } from 'lucide-react';
import { sendSharedMessage, onSharedMessagesChange, sendSharedPoll, voteOnSharedPoll } from '../firebase/firestoreService';
import { useApp } from '../context/AppContext';

export default function SharedMessageBox({ roleTitle, forceOpen, onClose, hideFloatingButton, inline }) {
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  const isOpen = inline ? true : (forceOpen !== undefined ? forceOpen : isOpenInternal);
  
  const handleToggle = () => {
    if (forceOpen !== undefined && onClose) {
      if (isOpen) onClose();
      else onClose(!isOpen);
    } else {
      setIsOpenInternal(!isOpenInternal);
    }
  };
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const messagesEndRef = useRef(null);
  const { user } = useApp();

  // Handle fallback context
  const currentName = user?.name || (roleTitle === 'Monitor' ? 'Third-Party Monitor' : 'Employee');
  const currentRole = user?.role || (roleTitle === 'Monitor' ? 'monitor' : 'employee');

  useEffect(() => {
    const unsubscribe = onSharedMessagesChange((newMessages) => {
      setMessages(newMessages);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
    return () => unsubscribe();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');
    await sendSharedMessage(currentName, currentRole, text);
  };

  const handleAddOption = () => {
    if (pollOptions.length < 5) setPollOptions([...pollOptions, '']);
  };

  const handleOptionChange = (idx, val) => {
    const newOps = [...pollOptions];
    newOps[idx] = val;
    setPollOptions(newOps);
  };

  const handleSendPoll = async (e) => {
    e.preventDefault();
    // Validate poll
    if (!pollQuestion.trim() || pollOptions.some(o => !o.trim())) return;
    await sendSharedPoll(currentName, currentRole, pollQuestion, pollOptions.map(o => o.trim()));
    setIsCreatingPoll(false);
    setPollQuestion('');
    setPollOptions(['', '']);
  };

  const handleVote = async (messageId, optionIndex) => {
    await voteOnSharedPoll(messageId, optionIndex, currentName);
  };

  const chatContent = (
    <>
      <div className={`${inline ? 'px-8 py-6 bg-white border-b border-gray-100' : 'bg-gradient-to-r from-purple-500 to-pink-500 p-4 border-none'} text-white flex items-center justify-between`}>
        <div>
          <h3 className={`font-semibold ${inline ? 'text-2xl text-gray-800 tracking-tight' : 'text-sm text-white'}`}>Direct Comm Link</h3>
          <p className={`${inline ? 'text-sm text-gray-500 mt-1 font-medium' : 'text-[10px] text-white/80'}`}>Employees & Monitors Secure Chat</p>
        </div>
        {!inline && (
          <button onClick={handleToggle} className="p-1 hover:bg-white/20 rounded-full transition-colors text-white">
            <X size={18} />
          </button>
        )}
      </div>

      <div className={`flex-1 overflow-y-auto ${inline ? 'p-8 gap-5 bg-[#fafafa]/50' : 'p-4 gap-3 bg-gray-50'} flex flex-col`}>
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mt-10 font-medium">No messages yet. Say hello!</div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderName === currentName;
            
            if (msg.type === 'poll') {
              const totalVotes = msg.options?.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0) || 0;
              const myVoteIndex = msg.options?.findIndex(o => o.votes?.includes(currentName));
              
              return (
                 <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} w-full mb-2`}>
                   <span className={`text-[10px] text-gray-400 mb-1 px-1 font-bold tracking-wide uppercase`}>
                     {msg.senderName} <span className="text-[#ec4899] ml-1">[{msg.role}]</span> • POLL
                   </span>
                   <div className={`w-full max-w-sm rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm ${isMine ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 text-white">
                        <h4 className="font-bold text-sm tracking-wide">{msg.text}</h4>
                      </div>
                      <div className="p-3 space-y-2">
                        {msg.options?.map((opt, i) => {
                          const count = opt.votes?.length || 0;
                          const perc = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                          const hasVoted = myVoteIndex === i;
                          return (
                            <button 
                              key={i} 
                              onClick={() => handleVote(msg.id, i)}
                              className={`relative w-full text-left p-2 rounded-xl overflow-hidden border transition-all text-sm font-medium hover:border-purple-300 ${hasVoted ? 'border-purple-500 text-purple-800 bg-purple-50' : 'border-gray-200 text-gray-700 bg-gray-50'}`}
                            >
                               <div className="absolute inset-y-0 left-0 bg-purple-200/50 transition-all duration-500" style={{ width: `${perc}%` }} />
                               <div className="relative flex justify-between">
                                 <span>{opt.text}</span>
                                 <span className="font-bold text-gray-500">{count > 0 ? count : ''}</span>
                               </div>
                            </button>
                          )
                        })}
                        <div className="text-right text-xs text-gray-400 font-medium pt-1 mt-2 border-t border-gray-100">
                          {totalVotes} total votes
                        </div>
                      </div>
                   </div>
                 </div>
              );
            }

            return (
              <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} mb-1`}>
                <span className={`text-[10px] text-gray-400 mb-1 px-1 font-bold tracking-wide uppercase`}>
                  {msg.senderName} <span className="text-[#ec4899] ml-1">[{msg.role}]</span>
                </span>
                <div className={`${inline ? 'px-5 py-3 text-base' : 'px-4 py-2.5 text-sm'} rounded-2xl max-w-[85%] ${
                  isMine 
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-tr-sm shadow-md shadow-pink-200' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {isCreatingPoll ? (
        <form onSubmit={handleSendPoll} className={`bg-purple-50/50 border-t border-purple-100 flex flex-col gap-3 ${inline ? 'p-6 px-8' : 'p-4'}`}>
          <div className="flex justify-between items-center mb-1">
             <h4 className="text-sm font-bold text-purple-900 flex items-center gap-2">
                <BarChart2 size={16} className="text-purple-500"/> Create an Interactive Poll
             </h4>
             <button type="button" onClick={() => setIsCreatingPoll(false)} className="text-purple-400 hover:text-purple-600 p-1 bg-white rounded-full shadow-sm"><X size={14}/></button>
          </div>
          <input 
            type="text" placeholder="What's your question?" 
            value={pollQuestion} onChange={e => setPollQuestion(e.target.value)}
            className="w-full py-2.5 px-4 text-sm bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 text-gray-900 font-bold shadow-sm"
          />
          <div className="space-y-2">
            {pollOptions.map((opt, i) => (
              <input 
                 key={i} type="text" placeholder={`Option ${i+1}`}
                 value={opt} onChange={e => handleOptionChange(i, e.target.value)}
                 className="w-full py-2 px-4 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 text-gray-700 shadow-sm"
              />
            ))}
          </div>
          <div className="flex justify-between items-center mt-2">
             <button type="button" onClick={handleAddOption} disabled={pollOptions.length >= 5} className="text-xs font-bold text-purple-600 hover:text-purple-800 disabled:opacity-50 px-2">
               + Add Another Option
             </button>
             <button type="submit" disabled={!pollQuestion.trim() || pollOptions.some(o => !o.trim())} className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:shadow-lg hover:shadow-pink-200 disabled:opacity-50 transition-all">
               Send Poll Now
             </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSend} className={`bg-white border-t border-gray-100 flex items-center gap-3 ${inline ? 'p-6 px-8' : 'p-3'}`}>
          <button 
            type="button" 
            onClick={() => setIsCreatingPoll(true)}
            title="Create a Poll"
            className={`${inline ? 'w-12 h-12 rounded-2xl' : 'w-10 h-10 rounded-full'} bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-100 transition-colors shadow-sm shrink-0`}
          >
            <BarChart2 size={18} />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your secure message..."
            className={`${inline ? 'py-4 text-base shadow-inner bg-gray-50/50 rounded-2xl' : 'py-2.5 text-sm bg-gray-50 rounded-full'} flex-1 border border-gray-200 px-5 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all text-gray-800 font-medium`}
          />
          <button 
            type="submit"
            disabled={!inputText.trim()}
            className={`${inline ? 'w-14 h-14 rounded-2xl' : 'w-10 h-10 rounded-full'} bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all shadow-md hover:shadow-lg hover:shadow-pink-200 shrink-0`}
          >
            <Send size={inline ? 20 : 16} className={`${inline ? 'ml-1' : 'ml-0.5'}`} />
          </button>
        </form>
      )}
    </>
  );

  if (inline) {
    return (
      <div className="w-full h-full flex-1 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-white overflow-hidden flex flex-col relative z-20 transition-all">
        {chatContent}
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-16 right-0 w-[320px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
            style={{ height: '420px' }}
          >
            {chatContent}
          </motion.div>
        )}
      </AnimatePresence>

      {!hideFloatingButton && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggle}
          className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-xl shadow-pink-200 flex items-center justify-center transition-all bg-size-200 hover:bg-right"
        >
          <MessageSquare size={24} />
        </motion.button>
      )}
    </div>
  );
}
