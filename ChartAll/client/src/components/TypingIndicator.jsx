import React from 'react';
import { motion } from 'framer-motion';

export default function TypingIndicator({ count = 1 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="flex justify-start mb-1"
    >
      <div className="bg-[#182533] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="text-[11px] text-[#5a6d80] ml-1">
          {count === 1 ? 'typing...' : `${count} people typing...`}
        </span>
      </div>
    </motion.div>
  );
}
