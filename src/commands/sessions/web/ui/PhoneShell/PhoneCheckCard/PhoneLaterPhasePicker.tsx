import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useState } from "react";
import type { LaterPhase } from "../../../../shared/askCheckInputSchema";

export function PhoneLaterPhasePicker({
	phases,
	disabled,
	onPick,
}: {
	phases: LaterPhase[];
	disabled: boolean;
	onPick: (phase: number) => void;
}) {
	const [open, setOpen] = useState(false);
	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
			<Button
				variant="outlined"
				disabled={disabled}
				endIcon={<ArrowDropDownIcon />}
				aria-expanded={open}
				onClick={() => setOpen((value) => !value)}
			>
				Later phase
			</Button>
			{open &&
				phases.map((phase) => (
					<Button
						key={phase.number}
						variant="tonal"
						disabled={disabled}
						onClick={() => onPick(phase.number)}
					>
						Phase {phase.number}: {phase.name}
					</Button>
				))}
		</Box>
	);
}
