import { Injectable } from "@angular/core";
import { games } from "../constants/games";

@Injectable({
    providedIn: "root"
})


export class GamesFiltersService{
    gamesArray = games;
    activeTags: string[] = [];

    addActiveTag(tag: string){
        if(this.activeTags.includes(tag)) return;
        this.activeTags.push(tag);
        this.#filterGames();
    };

    removeTag(tag: string){
        this.activeTags = this.activeTags.filter((curTag) => curTag !== tag);
        this.#filterGames()
    }

    #filterGames(){
        this.gamesArray = games.filter((game) => game.tags.some((tag) => this.activeTags.includes(tag)));
    }
}