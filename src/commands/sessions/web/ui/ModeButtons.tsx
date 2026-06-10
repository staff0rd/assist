import Button from "@mui/material/Button";
import type { ReactNode } from "react";
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
	children,
}: {
	onSelect: (m: SessionMode, text?: string) => void;
	disabled?: boolean;
	children?: ReactNode;
}) {
	return (
		<>
			{MODES.filter((m) => m.nav && m.prompt).map((m) => (
				<FreePromptDropdown
					key={m.value}
					label={m.label}
					allowEmpty
					disabled={disabled}
					onSubmit={(text) => onSelect(m.value, text)}
				/>
			))}
			{children}
			{MODES.filter((m) => m.nav && !m.prompt).map((m) => (
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
