import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.component';
import { Minesweeper } from './pages/minesweeper/minesweeper.component';
import { MemoryGame } from './pages/memoryGame/memoryGame.component';
import { Battleship } from './pages/battleship/battleship.component';

export const routes: Routes = [
        {
            path: "",
            component: HomePage
        },
        {
            path: "minesweeper",
            component: Minesweeper,
        },
        {
            path: "memory-game",
            component: MemoryGame
        },
        {
            path: "battleship",
            component: Battleship
        }

];
