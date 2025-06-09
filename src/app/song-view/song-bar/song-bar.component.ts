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
  @Input() voiceColors?: Map<string, string>;
  @Input() maxVoiceWidth: string = '0px';
  @Input() voiceFilter: string[] = [];

  get lines(): string[] {
    return this.line.split('\n');
  }

  getVoiceStyle(line: string) {
    const voice = line.split(':')[0].trim();
    if (this.voiceColors?.has(voice)) {
      return { color: this.voiceColors.get(voice), width: this.maxVoiceWidth };
    } else {
      return { width: this.maxVoiceWidth };
    }
  }

  getVoice(line: string): string | null {
    const match = line.match(/^(.+?):/i);
    return match ? match[1] : null;
  }

  getLineText(line: string): string {
    return line.replace(/^(.*?):\s*/i, '');
  }

  /** are all lines filtered away? */
  isCompletelyFilteredOut(): boolean{
    // to be completely filtered, every line musst be filtered out
    return this.lines.every(line => {
      const voice = this.getVoice(line);
      return !!voice // The line needs to have a voice or it is not filtered
          && !this.voiceFilter.includes(voice); // The voice is not inlcuded in the (whitelist)filter
    })
  }
}
