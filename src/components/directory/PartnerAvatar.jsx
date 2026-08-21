import React from 'react';

const GRADIENTS = [
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-red-600',
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-purple-600',
  'from-lime-500 to-green-600'
];

function hashName(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h;
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Shows partner logo if available, otherwise shows an initials avatar
 * with a color gradient derived deterministically from the partner name.
 * size: 'sm' (w-9 h-9), 'md' (w-14 h-14), 'lg' (w-24 h-24)
 * shape: 'rounded-lg' | 'rounded-full'
 */
export default function PartnerAvatar({ partner, size = 'md', shape = 'rounded-lg', className = '' }) {
  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-14 h-14',
    lg: 'w-24 h-24'
  };
  const initialsSizes = { sm: 'text-xs', md: 'text-base', lg: 'text-2xl' };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const initialsSize = initialsSizes[size] || initialsSizes.md;

  if (partner?.logo_url) {
    return (
      <img
        src={partner.logo_url}
        alt={partner.name}
        className={`${sizeClass} ${shape} object-cover border border-border/50 my-2 ${className}`}
      />
    );
  }

  const gradient = GRADIENTS[hashName(partner?.name || '') % GRADIENTS.length];

  return (
    <div className={`${sizeClass} ${shape} bg-gradient-to-br ${gradient} flex items-center justify-center border border-border/50 my-2 ${className}`}>
      <span className={`${initialsSize} font-bold text-white`}>{getInitials(partner?.name)}</span>
    </div>
  );
}