import Button from "@mui/material/Button";
import { MODES, type SessionMode } from "./isAssistMode";

const btnSx = {
	textTransform: "none",
	fontSize: 13,
	py: 0.25,
	px: 1.25,
} as const;

export function ModeButtons({
	mode,
	selectedRun,
	onSelect,
}: {
	mode: SessionMode;
	selectedRun: string | null;
	onSelect: (m: SessionMode) => void;
}) {
	return (
		<>
			{MODES.map((m) => (
				<Button
					key={m.value}
					size="small"
					variant={!selectedRun && mode === m.value ? "contained" : "outlined"}
					onClick={() => onSelect(m.value)}
					sx={btnSx}
				>
					{m.label}
				</Button>
			))}
		</>
	);
}
