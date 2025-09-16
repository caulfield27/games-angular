import { ILevelOption } from "../../../shared/types/types";

export const digitSegments: {[key: string] : string[]} = {
  0: ["a", "b", "c", "d", "e", "f"],
  1: ["b", "c"],
  2: ["a", "b", "g", "e", "d"],
  3: ["a", "b", "c", "d", "g"],
  4: ["f", "g", "b", "c"],
  5: ["a", "f", "g", "c", "d"],
  6: ["a", "f", "e", "d", "c", "g"],
  7: ["a", "b", "c"],
  8: ["a", "b", "c", "d", "e", "f", "g"],
  9: ["a", "b", "c", "d", "g", "f"],
};

export const dropdownOptions: ILevelOption[] = [
  {
    name: "Лёгкий",
    value: "easy"
  },
  {
    name: "Средний",
    value: "medium"
  },
  {
    name: "Сложный",
    value: "hard"
  }
]