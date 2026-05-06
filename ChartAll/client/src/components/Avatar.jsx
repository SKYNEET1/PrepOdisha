import React from 'react';
import { getInitials } from '../lib/utils';

const COLORS = [
  'from-blue-500 to-blue-700',
  'from-purple-500 to-purple-700',
  'from-green-500 to-green-700',
  'from-pink-500 to-pink-700',
  'from-orange-500 to-orange-700',
  'from-teal-500 to-teal-700',
  'from-red-500 to-red-700',
  'from-indigo-500 to-indigo-700',
];

function pickColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

const SIZE_MAP = {
  xs: 'w-7 h-7 text-[10px]',
  sm: 'w-9 h-9 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-14 h-14 text-base',
};

export default function Avatar({ name = '', size = 'md', self = false }) {
  const initials = self ? 'Me' : getInitials(name) || '?';
  const color = self ? 'from-[#5288c1] to-[#3a6a9e]' : pickColor(name);
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-semibold text-white flex-shrink-0 select-none`}>
      {initials}
    </div>
  );
}
