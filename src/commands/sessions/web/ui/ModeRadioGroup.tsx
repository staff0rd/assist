import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import { modeRadioKeyHandler } from "./modeRadioKeyHandler";
import { type NewSessionMode, newSessionModeOrder } from "./newSessionModes";

const groupSx = {
	border: 1,
	borderColor: "divider",
	borderRadius: 1,
	height: 40,
	p: "2px",
	flexShrink: 0,
} as const;

const radioSx = {
	px: 1.5,
	borderRadius: 0.75,
	fontSize: 12,
	fontWeight: 600,
	color: "text.secondary",
	"&:hover": { color: "text.primary", bgcolor: "action.hover" },
	"&[aria-checked='true']": {
		color: "primary.main",
		bgcolor: "action.selected",
	},
	"&.Mui-focusVisible": { outline: 2, outlineColor: "primary.main" },
} as const;

export function ModeRadioGroup({
	value,
	onChange,
}: {
	value: NewSessionMode;
	onChange: (mode: NewSessionMode) => void;
}) {
	return (
		<Stack
			direction="row"
			role="radiogroup"
			aria-label="Mode"
			spacing="2px"
			onKeyDown={modeRadioKeyHandler(value, onChange)}
			sx={groupSx}
		>
			{newSessionModeOrder.map((m) => (
				<ButtonBase
					key={m}
					role="radio"
					aria-checked={m === value}
					data-mode={m}
					tabIndex={m === value ? 0 : -1}
					onClick={() => onChange(m)}
					sx={radioSx}
				>
					{m}
				</ButtonBase>
			))}
		</Stack>
	);
}
