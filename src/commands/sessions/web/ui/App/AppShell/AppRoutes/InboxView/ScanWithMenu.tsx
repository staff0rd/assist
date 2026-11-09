import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Button, ListItemText, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import type { HarnessKind } from "../../../../../../../../shared/harnesses";
import type { InboxHarnessOption } from "./inboxHarnessOptions";

export function ScanWithMenu({
	options,
	disabled,
	onPick,
}: {
	options: InboxHarnessOption[];
	disabled: boolean;
	onPick: (kind: HarnessKind) => void;
}) {
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	if (options.length === 0) return null;
	return (
		<>
			<Button
				variant="outlined"
				size="small"
				endIcon={<ArrowDropDownIcon />}
				aria-haspopup="menu"
				aria-expanded={anchor !== null}
				disabled={disabled}
				onClick={(event) => setAnchor(event.currentTarget)}
			>
				Scan with
			</Button>
			<Menu
				anchorEl={anchor}
				open={anchor !== null}
				onClose={() => setAnchor(null)}
			>
				{options.map((option) => (
					<MenuItem
						key={option.kind}
						disabled={option.unavailable !== undefined}
						onClick={() => {
							setAnchor(null);
							onPick(option.kind);
						}}
					>
						<ListItemText
							primary={option.label}
							secondary={
								option.unavailable && `Unavailable: ${option.unavailable}`
							}
						/>
					</MenuItem>
				))}
			</Menu>
		</>
	);
}
