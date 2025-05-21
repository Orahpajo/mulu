import { Component, Input } from '@angular/core';
import { SecondsToMmssPipe } from '../../pipes/seconds-to-mmss.pipe';
import { CommonModule, NgStyle } from '@angular/common';

@Component({
  selector: 'app-song-bar',
  imports: [CommonModule, SecondsToMmssPipe],
  templateUrl: './song-bar.component.html',
  styleUrl: './song-bar.component.scss'
})
export class SongBarComponent {
  @Input() line: string = '';
  @Input() isCurrent: boolean = false;
  @Input() isInLoop: boolean = false;
  @Input() cue?: number;
  @Input() voices?: Map<string, string>;
  @Input() maxVoiceWidth: string = '0px';

  get lines(): string[] {
    return this.line.split('\n');
  }

  getVoiceStyle(line: string) {
    const voice = line.split(':')[0].trim();
    if (this.voices?.has(voice)) {
      return { color: this.voices.get(voice), width: this.maxVoiceWidth };
    } else {
      return { width: this.maxVoiceWidth };
    }
  }

  getVoice(line: string): string | null {
    const match = line.match(/^(.+):/i);
    return match ? match[1] : null;
  }

  getLineText(line: string): string {
    return line.replace(/^(.*):\s*/i, '');
  }
}
