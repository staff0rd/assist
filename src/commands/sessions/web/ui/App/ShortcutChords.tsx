import Box from "@mui/material/Box";
import type { Chord } from "./chordKeys";
import { formatChord } from "./formatChord";

const chipSx = {
	px: 0.5,
	border: 1,
	borderColor: "grey.500",
	borderRadius: 0.5,
	fontFamily: "monospace",
	fontSize: 11,
	whiteSpace: "nowrap",
} as const;

export function ShortcutChords({ chords }: { chords: readonly Chord[] }) {
	return chords.map((chord) => {
		const text = formatChord(chord);
		return (
			<Box key={text} component="kbd" sx={chipSx}>
				{text}
			</Box>
		);
	});
}
