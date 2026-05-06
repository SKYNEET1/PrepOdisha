import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, BookOpen, Users, Zap } from 'lucide-react';

const features = [
  { icon: BookOpen, label: 'Course Channels',    desc: 'Chat rooms auto-created for each enrolled course' },
  { icon: Users,    label: 'Student Community', desc: 'Connect with fellow learners in real time'         },
  { icon: Zap,      label: 'Instant Messaging', desc: 'Powered by Socket.IO for zero-latency chats'      },
];

export default function WelcomeScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#17212b] px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        {/* Animated logo */}
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#5288c1] to-[#3a6a9e] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#5288c1]/20"
        >
          <MessageSquare className="w-12 h-12 text-white" />
        </motion.div>

        <h2 className="text-2xl font-bold text-white mb-3">PrepOdisha Chat</h2>
        <p className="text-[#8a9bb0] text-sm leading-relaxed mb-8">
          Select a course from the left panel to start chatting with fellow students.
          All courses are <span className="text-[#5288c1] font-semibold">completely free</span> — enroll and dive in!
        </p>

        {/* Feature cards */}
        <div className="grid gap-3">
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="flex items-center gap-4 bg-[#232e3c] rounded-xl p-4 text-left border border-[#0f1923] hover:border-[#5288c1]/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#5288c1]/10 flex items-center justify-center flex-shrink-0">
                <f.icon className="w-5 h-5 text-[#5288c1]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{f.label}</p>
                <p className="text-xs text-[#5a6d80] mt-0.5">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-[#3a5068] mt-8">
          🔒 End-to-end encrypted • Built for students of Odisha
        </p>
      </motion.div>
    </div>
  );
}
