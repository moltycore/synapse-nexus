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
  return new Date().toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};
