import svetoyara from "./svetoyara";
import ogneyara from "./ogneyara";
import strizhgun from "./strizhgun";
import vedana from "./vedana";

export type SecretStoryId = "svetoyara" | "ogneyara" | "strizhgun" | "vedana";
export type SecretStoryBranch = "memory" | "life";

export type SecretStory = {
  id: SecretStoryId;
  title: string;
  subtitle: string;
  branch: SecretStoryBranch;
  paragraphs: readonly string[];
};

export const SECRET_STORY_ORDER: Record<SecretStoryBranch, SecretStoryId[]> = {
  memory: ["svetoyara", "ogneyara"],
  life: ["strizhgun", "vedana"],
};

export const SECRET_STORIES: Record<SecretStoryId, SecretStory> = {
  svetoyara: {
    id: "svetoyara",
    title: "Как Лель учил дочь любви",
    subtitle: "История Светояры до Яви",
    branch: "memory",
    paragraphs: svetoyara,
  },
  ogneyara: {
    id: "ogneyara",
    title: "Возлюбленные",
    subtitle: "То, что помнит огонь",
    branch: "memory",
    paragraphs: ogneyara,
  },
  strizhgun: {
    id: "strizhgun",
    title: "Второе сердце",
    subtitle: "История того, кто однажды перестал быть человеком",
    branch: "life",
    paragraphs: strizhgun,
  },
  vedana: {
    id: "vedana",
    title: "Чужое дыхание",
    subtitle: "История женщины, ставшей новым берегом",
    branch: "life",
    paragraphs: vedana,
  },
};

export const SECRET_STORY_IDS = Object.keys(SECRET_STORIES) as SecretStoryId[];

export function getSecretStory(id: string): SecretStory | null {
  return Object.prototype.hasOwnProperty.call(SECRET_STORIES, id)
    ? SECRET_STORIES[id as SecretStoryId]
    : null;
}
