export const parseSSE = (line: string): any | null => {
  const trimmed = line.replace(/^data:/, "").trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    return null;
  }
};

export const getTurkishTime = (): string => {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  return `${h >= 12 ? 'PM' : 'AM'} ${h % 12 || 12}:${m}`;
};
