import { Injectable, signal } from "@angular/core";
import { getFields, getLevels } from "../utils/utils";

@Injectable({
    providedIn: "root"
})

export class BoardService{
    levels = signal(getLevels(window.innerWidth));
    fields = signal(getFields(this.levels().easy));
}