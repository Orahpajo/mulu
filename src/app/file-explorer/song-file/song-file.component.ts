import { Component, Input } from '@angular/core';
import { SongFile } from '../song-file.model';
import {MatIconModule} from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-song-file',
  imports: [MatIconModule, RouterModule],
  templateUrl: './song-file.component.html',
  styleUrl: './song-file.component.scss'
})
export class SongFileComponent {

  @Input() file!: SongFile;

}
