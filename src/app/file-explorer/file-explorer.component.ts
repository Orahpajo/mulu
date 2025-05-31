import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { closeCurrentSongFile, createSongFile, openSongFile } from '../store/song-file.actions';
import { selectSongFiles, selectSongTreeNodes } from '../store/song-file.feature';
import { Router } from '@angular/router';
import { combineLatest, find, map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import {MatTreeModule} from '@angular/material/tree';
import { SongTreeNode } from '../model/song-tree-node';


@Component({
  selector: 'app-file-explorer',
  imports: [
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatListModule,
    MatTreeModule,
  ],
  templateUrl: './file-explorer.component.html',
  styleUrl: './file-explorer.component.scss',
})
export class FileExplorerComponent {

  @Input()
  sidenavOpen: boolean;
  @Output()
  sidenavOpenChange = new EventEmitter<boolean>();

  songs$= this.store.select(selectSongFiles);
  treeNodes$ = this.store.select(selectSongTreeNodes);

  childrenAccessor = (node: SongTreeNode) => node.children ?? [];
  hasChild = (_: number, node: SongTreeNode) => !!node.children && node.children.length > 0;


  constructor(private store: Store, private router: Router) {}

  newSong() {
    this.store.dispatch(createSongFile());
    this.router.navigate(['/song']);
    this.sidenavOpenChange.emit(false);
  }

   openSong(songId: string) {
    this.store.dispatch(openSongFile(songId));
    this.router.navigate(['/song']);
    this.sidenavOpenChange.emit(false);
  }

  songNameById(songId: string) {
    return this.songs$.pipe(
      map(songs => songs.find(song => song.id === songId) ?? {name: 'ERROR '+songId}),
      map(song => song.name)
    );
  }
  
}
