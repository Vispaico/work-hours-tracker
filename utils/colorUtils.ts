const JOB_COLOR_PALETTE = [
  '#f87171', // red-400
  '#fb923c', // orange-400
  '#fbbf24', // amber-400
  '#facc15', // yellow-400
  '#34d399', // emerald-400
  '#2dd4bf', // teal-400
  '#38bdf8', // sky-400
  '#60a5fa', // blue-400
  '#818cf8', // indigo-400
  '#a78bfa', // violet-400
  '#c084fc', // purple-400
  '#f472b6', // pink-400
  '#fb7185', // rose-400
];

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getJobColor = (jobId: string | undefined): string => {
  if (!jobId) {
    return '#3b82f6';
  }

  const hash = hashString(jobId);
  return JOB_COLOR_PALETTE[hash % JOB_COLOR_PALETTE.length];
};

export const getJobColorPalette = () => [...JOB_COLOR_PALETTE];
