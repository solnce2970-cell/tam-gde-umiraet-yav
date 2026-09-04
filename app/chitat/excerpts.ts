import { excerpt as pamyatIliZhizn } from "./data/pamyat-ili-zhizn";
import { excerpt as zryaTyEeSpas } from "./data/zrya-ty-ee-spas";
import { excerpt as lesPrishelKNeiSam } from "./data/les-prishel-k-nei-sam";
import { excerpt as sonKotoryyBylNeEgo } from "./data/son-kotoryy-byl-ne-ego";
import { excerpt as slishkomBlizko } from "./data/slishkom-blizko";
import { excerpt as koshka } from "./data/koshka-kotoruyu-nikto-ne-prosil-govorit";
import { excerpt as domKotoryyGulyal } from "./data/dom-kotoryy-gulyal";

export type Excerpt = {
  id: string;
  title: string;
  chapter: string;
  teaser: string[];
  body: string[];
};

export const excerpts: Excerpt[] = [
  pamyatIliZhizn,
  zryaTyEeSpas,
  lesPrishelKNeiSam,
  sonKotoryyBylNeEgo,
  slishkomBlizko,
  koshka,
  domKotoryyGulyal,
];

export function getExcerpt(id: string) {
  return excerpts.find((item) => item.id === id);
}
