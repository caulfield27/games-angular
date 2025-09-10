import { ElementRef, Injectable, signal } from "@angular/core";
import { games } from "../constants/games";
import { IGames } from "../types";

@Injectable({
    providedIn: "root"
})


export class GamesFiltersService {
    gamesArray = signal<IGames[]>(games);
    activeTags = signal<string[]>([]);

    addActiveTag(tag: string, searchVal: string) {
        if (this.activeTags().includes(tag)) return;
        this.activeTags.update(prev => [...prev, tag]);
        this.gamesArray.set(this.filterGames(searchVal));
    };

    removeTag(tag: string, searchVal: string) {
        this.activeTags.set(this.activeTags().filter((curTag) => curTag !== tag));
        this.gamesArray.set(this.filterGames(searchVal));
    }

    filterGames(searchVal: string) {
        const tags = this.activeTags();

        return games.filter((game) =>
            (!searchVal || game.name.toLowerCase().includes(searchVal.toLowerCase()))
            && (!tags.length || game.tags.some((tag) => tags.includes(tag))))
    }
}