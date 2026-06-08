import Button from "@mui/material/Button";
import { MODES, type SessionMode } from "./dispatchMode";
import { FreePromptDropdown } from "./FreePromptDropdown";

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
	onSelect: (m: SessionMode, text?: string) => void;
	disabled?: boolean;
}) {
	return (
		<>
			{MODES.map((m) =>
				m.prompt ? (
					<FreePromptDropdown
						key={m.value}
						label={m.label}
						allowEmpty
						disabled={disabled}
						onSubmit={(text) => onSelect(m.value, text)}
					/>
				) : (
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
				),
			)}
		</>
	);
}
