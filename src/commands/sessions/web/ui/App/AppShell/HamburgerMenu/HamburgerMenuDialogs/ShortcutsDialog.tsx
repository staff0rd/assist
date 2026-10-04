import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ShortcutChords } from "../../ShortcutChords";
import { shortcutRegistry } from "../../../shortcutRegistry";
import { groupShortcuts } from "./ShortcutsDialog/groupShortcuts";

const titleSx = {
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	pr: 1,
} as const;
const rowSx = {
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	gap: 2,
	py: 0.5,
} as const;
const groups = groupShortcuts(Object.values(shortcutRegistry));

export function ShortcutsDialog({ onClose }: { onClose: () => void }) {
	return (
		<Dialog
			open
			onClose={onClose}
			maxWidth="xs"
			fullWidth
			aria-labelledby="shortcuts-dialog-title"
		>
			<DialogTitle id="shortcuts-dialog-title" sx={titleSx}>
				Keyboard shortcuts
				<IconButton size="small" aria-label="Close" onClick={onClose}>
					<CloseIcon fontSize="small" />
				</IconButton>
			</DialogTitle>
			<DialogContent dividers>
				{groups.map((group) => (
					<Box key={group.name} component="section" sx={{ mb: 1.5 }}>
						<Typography variant="overline" color="text.secondary">
							{group.name}
						</Typography>
						{group.shortcuts.map((shortcut) => (
							<Box key={shortcut.label} sx={rowSx}>
								<Typography variant="body2">{shortcut.label}</Typography>
								<Stack direction="row" spacing={0.5}>
									<ShortcutChords chords={shortcut.chords} />
								</Stack>
							</Box>
						))}
					</Box>
				))}
			</DialogContent>
		</Dialog>
	);
}
