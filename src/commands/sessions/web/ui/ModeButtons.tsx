import Button from "@mui/material/Button";
import { MODES, type SessionMode } from "./dispatchMode";

// match FilterTrigger metrics so mode buttons align in height with the dropdowns
const btnSx = {
	textTransform: "none",
	fontSize: 11,
	fontWeight: 600,
} as const;

export function ModeButtons({
	onSelect,
	disabled = false,
}: {
	onSelect: (m: SessionMode) => void;
	disabled?: boolean;
}) {
	return (
		<>
			{MODES.map((m) => (
				<Button
					key={m.value}
					size="small"
					variant="outlined"
					disabled={disabled}
					onClick={() => onSelect(m.value)}
					sx={btnSx}
				>
					{m.label}
				</Button>
			))}
		</>
	);
}
