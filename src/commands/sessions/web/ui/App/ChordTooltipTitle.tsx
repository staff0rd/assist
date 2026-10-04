import Stack from "@mui/material/Stack";
import type { Chord } from "./chordKeys";
import { ShortcutChords } from "./ShortcutChords";

export function ChordTooltipTitle({
	label,
	chords,
}: {
	label: string;
	chords: readonly Chord[];
}) {
	return (
		<Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
			<span>{label}</span>
			<ShortcutChords chords={chords} />
		</Stack>
	);
}
