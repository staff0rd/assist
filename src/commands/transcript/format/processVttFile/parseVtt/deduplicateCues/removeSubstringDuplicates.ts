import type { VttCue } from "../../../../types";

function normalizeText(text: string): string {
	return text.toLowerCase().trim();
}

function checkSubstringRelation(
	textI: string,
	textJ: string,
): "i-contains-j" | "j-contains-i" | null {
	if (textI.includes(textJ) && textI.length > textJ.length)
		return "i-contains-j";
	if (textJ.includes(textI) && textJ.length > textI.length)
		return "j-contains-i";
	return null;
}

function isNearby(a: VttCue, b: VttCue): boolean {
	return b.startMs - a.endMs <= 10000;
}

function comparePair(
	cueI: VttCue,
	cueJ: VttCue,
): "remove-j" | "remove-i" | null {
	if (cueI.speaker !== cueJ.speaker) return null;
	const relation = checkSubstringRelation(
		normalizeText(cueI.text),
		normalizeText(cueJ.text),
	);
	if (relation === "i-contains-j") return "remove-j";
	if (relation === "j-contains-i") return "remove-i";
	return null;
}

function scanForward(
	cues: VttCue[],
	i: number,
	toRemove: Set<number>,
): boolean {
	for (let j = i + 1; j < cues.length; j++) {
		if (toRemove.has(j)) continue;
		if (!isNearby(cues[i], cues[j])) break;

		const action = comparePair(cues[i], cues[j]);
		if (action === "remove-j") toRemove.add(j);
		else if (action === "remove-i") return true;
	}
	return false;
}

export function removeSubstringDuplicates(cues: VttCue[]): VttCue[] {
	const toRemove = new Set<number>();

	for (let i = 0; i < cues.length; i++) {
		if (toRemove.has(i)) continue;
		if (scanForward(cues, i, toRemove)) toRemove.add(i);
	}

	return cues.filter((_, i) => !toRemove.has(i));
}
