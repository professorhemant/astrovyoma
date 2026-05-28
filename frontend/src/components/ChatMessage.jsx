import React from 'react';
import { motion } from 'framer-motion';

export default function ChatMessage({ message, isUser, senderName, avatarUrl }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border border-gold-600/40">
          {avatarUrl ? (
            <img src={avatarUrl} alt={senderName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-cosmic-800 flex items-center justify-center text-gold-400 text-sm">
              ✦
            </div>
          )}
        </div>
      )}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {senderName && !isUser && (
          <span className="text-xs text-gold-500 font-medium px-1">{senderName}</span>
        )}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-gold-600/20 border border-gold-600/30 text-gray-100 rounded-tr-sm'
              : 'bg-cosmic-800/80 border border-gold-600/15 text-gray-200 rounded-tl-sm'
          }`}
        >
          {message.content || message}
        </div>
      </div>
    </motion.div>
  );
}
