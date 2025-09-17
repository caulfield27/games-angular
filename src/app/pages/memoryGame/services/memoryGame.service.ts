import { Injectable, signal } from "@angular/core";
import { images } from "../constants/data";

@Injectable({
  providedIn: 'root',
})

export class GameService{
    cards = signal(images.cars.slice(0,16));
    quantity = 16;
}