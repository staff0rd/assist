import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import type { HarnessKind } from "../../../../../../../../../../shared/harnesses";
import { harnessLabel } from "../../../../../../../../../../shared/harnessLabel";

export function HarnessMenu({
	anchor,
	harness,
	harnesses,
	onPick,
	onClose,
}: {
	anchor: HTMLElement | null;
	harness: HarnessKind;
	harnesses: HarnessKind[];
	onPick: (harness: HarnessKind) => void;
	onClose: () => void;
}) {
	return (
		<Menu
			open={anchor !== null}
			anchorEl={anchor}
			onClose={onClose}
			slotProps={{ list: { dense: true, "aria-label": "Harness" } }}
		>
			{harnesses.map((choice) => (
				<MenuItem
					key={choice}
					role="menuitemradio"
					aria-checked={choice === harness}
					selected={choice === harness}
					onClick={() => {
						onPick(choice);
						onClose();
					}}
					sx={{ fontSize: 13 }}
				>
					{harnessLabel(choice)}
				</MenuItem>
			))}
		</Menu>
	);
}
