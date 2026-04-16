import Button from "@mui/material/Button";
import { MODES, type SessionMode } from "./dispatchMode";

const btnSx = {
	textTransform: "none",
	fontSize: 13,
	py: 0.25,
	px: 1.25,
} as const;

export function ModeButtons({
	onSelect,
}: {
	onSelect: (m: SessionMode) => void;
}) {
	return (
		<>
			{MODES.map((m) => (
				<Button
					key={m.value}
					size="small"
					variant="outlined"
					onClick={() => onSelect(m.value)}
					sx={btnSx}
				>
					{m.label}
				</Button>
			))}
		</>
	);
}
