import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { ToolbarComponent } from "./toolbar/toolbar.component";
import { Store } from '@ngrx/store';
import { loadSongFiles } from './store/song-file.actions';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToolbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(private titleService: Title, readonly store: Store) {}

  ngOnInit(): void {
    this.titleService.setTitle(environment.title);
    this.store.dispatch(loadSongFiles())
  }
}
