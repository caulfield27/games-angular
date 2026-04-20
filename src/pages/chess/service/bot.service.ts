import { Injectable } from "@angular/core";


@Injectable({
    providedIn: 'root'
})

export class BotService{
    engine: Worker | null = null;
    constructor(){}
}