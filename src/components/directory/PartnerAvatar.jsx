import React from 'react';

function getPartnerRank(reviewCount = 0) {
  if (reviewCount >= 25) return '🥇';
  if (reviewCount >= 5) return '🥈';
  return '🥉';
}

/**
 * Shows partner logo if available, otherwise shows rank medal.
 * size: 'sm' (w-9 h-9), 'md' (w-14 h-14), 'lg' (w-24 h-24)
 * shape: 'rounded-lg' | 'rounded-full'
 */
export default function PartnerAvatar({ partner, size = 'md', shape = 'rounded-lg', className = '' }) {
  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-14 h-14',
    lg: 'w-24 h-24'
  };
  const medalSizes = { sm: 'text-2xl', md: 'text-3xl', lg: 'text-5xl' };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const medalSize = medalSizes[size] || medalSizes.md;

  if (partner?.logo_url) {
    return (
      <img
        src={partner.logo_url}
        alt={partner.name}
        className={`${sizeClass} ${shape} object-cover border border-border/50 px-3 ${className}`} />);


  }

  return (
    <div className={`${sizeClass} ${shape} bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border/50 ${className}`}>
      <span className={medalSize}>{getPartnerRank(partner?.review_count)}</span>
    </div>);

}