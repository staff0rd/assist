import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Button, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import type { LaterPhase } from "../../../../../../shared/askCheckInputSchema";

export function LaterPhaseButton({
	phases,
	onPick,
}: {
	phases: LaterPhase[];
	onPick: (phase: number) => void;
}) {
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	return (
		<>
			<Button
				variant="outlined"
				endIcon={<ArrowDropDownIcon />}
				aria-haspopup="menu"
				aria-expanded={anchor !== null}
				onClick={(event) => setAnchor(event.currentTarget)}
			>
				Later phase
			</Button>
			<Menu
				anchorEl={anchor}
				open={anchor !== null}
				onClose={() => setAnchor(null)}
			>
				{phases.map((phase) => (
					<MenuItem
						key={phase.number}
						onClick={() => {
							setAnchor(null);
							onPick(phase.number);
						}}
					>
						Phase {phase.number}: {phase.name}
					</MenuItem>
				))}
			</Menu>
		</>
	);
}
