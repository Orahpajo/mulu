import { Component, Input } from '@angular/core';
import { SecondsToMmssPipe } from '../../pipes/seconds-to-mmss.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-song-bar',
  imports: [CommonModule, SecondsToMmssPipe],
  templateUrl: './song-bar.component.html',
  styleUrl: './song-bar.component.scss'
})
export class SongBarComponent {

  @Input() line: string = '';
  @Input() isCurrent: boolean = false;
  @Input() cue?: number;
  @Input() index!: number;
  @Input() textmode!: 'view' | 'mark' | 'edit';

  get lines(): string[] {
    return this.line.split('\n');
  }
  
  getVoiceClass(line: string): string {
    if (line.toLowerCase().startsWith('s:')) return 'voice-s';
    if (line.toLowerCase().startsWith('a:')) return 'voice-a';
    if (line.toLowerCase().startsWith('t:')) return 'voice-t';
    if (line.toLowerCase().startsWith('b:')) return 'voice-b';
    return '';
  }
}
