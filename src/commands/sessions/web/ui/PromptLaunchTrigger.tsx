import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import type { Ref } from "react";

const btnSx = { textTransform: "none", fontSize: 11 } as const;
const caretSx = { minWidth: 0, px: 0.25 } as const;

export function PromptLaunchTrigger({
	disabled,
	showCaret,
	promptOpen,
	caretRef,
	onPrompt,
	onCaret,
}: {
	disabled: boolean;
	showCaret: boolean;
	promptOpen: boolean;
	caretRef: Ref<HTMLButtonElement>;
	onPrompt: () => void;
	onCaret: () => void;
}) {
	return (
		<ButtonGroup size="small" variant="outlined" disabled={disabled}>
			<Button
				endIcon={promptOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
				sx={btnSx}
				onClick={onPrompt}
			>
				prompt
			</Button>
			{showCaret && (
				<Button
					ref={caretRef}
					aria-label="Launch with a different harness"
					sx={caretSx}
					onClick={onCaret}
				>
					<ArrowDropDownIcon fontSize="small" />
				</Button>
			)}
		</ButtonGroup>
	);
}
