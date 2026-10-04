import { z } from "zod";
import { parseChord } from "./parseChord";

function chordSchema(modifiersOnly: boolean) {
	return z.string().superRefine((value, ctx) => {
		const parsed = parseChord(value, { modifiersOnly });
		if (!parsed.ok) ctx.addIssue({ code: "custom", message: parsed.error });
	});
}

const keyChord = chordSchema(false).optional();

export const hotkeysSchema = z.strictObject({
	navTab: chordSchema(true).optional(),
	focusSidebar: keyChord,
	focusTerminal: keyChord,
	toggleDiff: keyChord,
	focusRepoPicker: keyChord,
	openConfig: keyChord,
	openMenu: keyChord,
	focusAddAgent: keyChord,
	focusVsCode: keyChord,
	focusDone: keyChord,
	nextWaiting: keyChord,
	newSession: keyChord,
	quickOpen: keyChord,
	save: keyChord,
	shortcutsSheet: keyChord,
});
