import React from 'react';

export const AdBannerPlaceholder: React.FC = () => (
  <div
    className="w-[320px] max-w-full h-[50px] rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 text-gray-500 dark:text-gray-300 text-[11px] uppercase tracking-[0.2em] flex items-center justify-center shadow-sm"
    role="complementary"
    aria-label="Ad placement placeholder"
  >
    Ad Placement · 320×50
  </div>
);
