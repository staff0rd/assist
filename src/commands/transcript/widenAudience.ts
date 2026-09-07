import { widenAudienceInText } from "./widenAudienceInText";
import type { VttCue, VttPassage } from "./types";

function strip(cues: VttCue[]): VttCue[] {
	return cues
		.map((cue) => ({ ...cue, text: widenAudienceInText(cue.text) }))
		.filter((cue) => /[a-z0-9]/i.test(cue.text));
}

export function widenAudience(passages: VttPassage[]): VttPassage[] {
	return passages
		.map((passage) => ({ ...passage, cues: strip(passage.cues) }))
		.filter((passage) => passage.cues.length > 0)
		.map((passage) => ({ ...passage, sourceStartMs: passage.cues[0].startMs }));
}
