import Stack from "@mui/material/Stack";
import { ShortcutChords } from "../../ShortcutChords";
import { shortcutRegistry } from "../../../shortcutRegistry";

export function NewSessionTooltipTitle() {
	const { label, chords } = shortcutRegistry.newSession;
	return (
		<Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
			<span>{label}</span>
			<ShortcutChords chords={chords} />
		</Stack>
	);
}
