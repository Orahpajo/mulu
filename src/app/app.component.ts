import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToolbarComponent } from "./toolbar/toolbar.component";
import { Store } from '@ngrx/store';
import { loadSongFiles } from './store/song-file.actions';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToolbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'mulu';

  constructor(readonly store: Store) {
  }

  ngOnInit(): void {
    this.store.dispatch(loadSongFiles())
  }
}
