import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterOutlet } from '@angular/router';
import { ToolbarComponent } from "./toolbar/toolbar.component";
import { Store } from '@ngrx/store';
import { closeCurrentSongFile, loadSongFiles } from './store/song-file.actions';
import { environment } from '../environments/environment';
import { MatSidenavModule } from '@angular/material/sidenav';
import { version } from '../environments/version'
import { FileExplorerComponent } from './file-explorer/file-explorer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToolbarComponent, FileExplorerComponent, MatSidenavModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  appVersion = version;
  sidenavOpen = false;

  constructor(private titleService: Title, readonly store: Store, readonly router: Router) {}

  ngOnInit(): void {
    this.titleService.setTitle(environment.title);
    this.store.dispatch(loadSongFiles())
    // close current songfile in reload
    this.store.dispatch(closeCurrentSongFile());
    this.router.navigate(['/']);
  }
}
