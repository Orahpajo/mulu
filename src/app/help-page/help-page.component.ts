import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SongBarComponent } from '../song-view/song-bar/song-bar.component';
import { MatListModule } from '@angular/material/list';
import { VoiceService } from '../services/voice.service';

interface Example {
  text: string;
  bars?: string[];
  voices?: Map<string, string>;
  maxVoiceWidth?: string;
}

@Component({
  selector: 'app-help-page',
  imports: [MatIconModule, MatButtonModule, MatFormFieldModule, FormsModule, MatInputModule, SongBarComponent, MatListModule],
  templateUrl: './help-page.component.html',
  styleUrl: './help-page.component.scss'
})
export class HelpPageComponent {
  firstExample: Example = {
    text: 'Dies ist die erste Zeile\n\nDies ist die zweite Zeile\nDies gehört noch zur zweiten Zeile', 
  }
  secondExample: Example = {
    text: 'voices:\n'+
            '  s: red\n'+
            '  a: gold\n'+
            '  t: lime\n'+
            '  b: fuchsia\n\n'+

          'Erste Songzeile\n' +
            's: Sopran singt etwas\n' +
            'a: Alt singt etwas\n' +
            't: Tenor singt etwas\n' +
            'b: Bass singt etwas\n',
  };

  constructor(readonly voiceService: VoiceService) {
    this.generateBarsAndVoices(this.firstExample);
    this.generateBarsAndVoices(this.secondExample);
  }

  generateBarsAndVoices(example: Example) {
    example.bars = example.text.split('\n\n');
    example.voices = this.voiceService.createVoices(example.bars);
    example.maxVoiceWidth = this.voiceService.calculateMaxVoiceWidth(example.voices);    
    example.bars = example.bars.filter(bar => !bar.toLowerCase().startsWith('voices:'));
  }
}
