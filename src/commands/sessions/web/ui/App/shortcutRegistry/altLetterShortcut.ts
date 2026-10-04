import { altChordCode } from "../altChordCode";

export function altLetterShortcut(
	label: string,
	group: string,
	letter: string,
) {
	return {
		label,
		group,
		chords: [["Alt", letter]],
		matches: (event: KeyboardEvent) => altChordCode(event) === `Key${letter}`,
	};
}
