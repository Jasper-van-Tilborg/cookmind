/**
 * Parse timer information from recipe instruction text
 * Detects time patterns like "15 minuten", "30 min", "2 uur", etc.
 * Returns time in seconds, or null if no time found
 */

export interface ParsedTimer {
  seconds: number;
  minutes: number;
  hours: number;
  originalText: string;
}

/**
 * Parse time from instruction text
 * @param instruction - The instruction text to parse
 * @returns ParsedTimer object with time in seconds, or null if no time found
 */
export function parseTimerFromInstruction(instruction: string): ParsedTimer | null {
  if (!instruction) return null;

  // Patterns to match:
  // - "15 minuten" or "15 min"
  // - "30 seconden" or "30 sec"
  // - "2 uur" or "2 u"
  // - "1.5 minuten" or "1,5 minuten" (decimal support)
  
  const patterns = [
    // Hours: "2 uur", "2 u", "1.5 uur"
    {
      regex: /(\d+(?:[.,]\d+)?)\s*(?:uur|u|hours?|h)\b/gi,
      multiplier: 3600, // Convert to seconds
    },
    // Minutes: "15 minuten", "15 min", "1.5 minuten"
    {
      regex: /(\d+(?:[.,]\d+)?)\s*(?:minuten|min|minutes?|m)\b/gi,
      multiplier: 60, // Convert to seconds
    },
    // Seconds: "30 seconden", "30 sec"
    {
      regex: /(\d+(?:[.,]\d+)?)\s*(?:seconden|sec|seconds?|s)\b/gi,
      multiplier: 1,
    },
  ];

  let totalSeconds = 0;
  let foundTime = false;
  const matchedTexts: string[] = [];

  for (const pattern of patterns) {
    const matches = instruction.matchAll(pattern.regex);
    
    for (const match of matches) {
      const value = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(value) && value > 0) {
        totalSeconds += value * pattern.multiplier;
        foundTime = true;
        matchedTexts.push(match[0]);
      }
    }
  }

  if (!foundTime || totalSeconds === 0) {
    return null;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return {
    seconds: Math.floor(totalSeconds),
    minutes,
    hours,
    originalText: matchedTexts.join(', '),
  };
}

/**
 * Format seconds to MM:SS or HH:MM:SS format
 */
export function formatTimer(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Format timer for display (e.g., "15 min", "2 uur 30 min")
 */
export function formatTimerDisplay(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  
  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'uur' : 'uur'}`);
  }
  
  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'min' : 'min'}`);
  }
  
  if (secs > 0 && hours === 0 && minutes === 0) {
    parts.push(`${secs} ${secs === 1 ? 'sec' : 'sec'}`);
  }

  return parts.join(' ') || '0 sec';
}
