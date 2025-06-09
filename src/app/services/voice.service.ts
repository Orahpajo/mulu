
export class VoiceService {

  constructor() { }

  createVoices(songBars: string[]) {
    const voices = new Map<string, string>();
    const voiceBar = songBars.find(bar => bar.toLowerCase().startsWith('voices:'));
    if (!voiceBar) return voices;

    const lines = voiceBar.split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*(.*?):\s*(.+)$/i);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        voices.set(key, value);
      }
    }
    return voices;
  }

  calculateMaxVoiceWidth(voices: Map<string, string>): string {
    const longestVoice = Array.from(voices.keys()).reduce((a, b) => (a.length > b.length ? a : b), '');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      context.font = 'bold 14px monospace';
      return `${context.measureText(longestVoice).width}px`;
    } else {
      return '50px'; // Fallback width if context is not available
    }
  }
}
