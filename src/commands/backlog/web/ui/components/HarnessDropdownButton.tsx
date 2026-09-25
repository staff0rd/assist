import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { IconButton, Tooltip } from "@mui/material";
import { type MouseEvent, useRef, useState } from "react";
import { useHarnessCapabilities } from "../../../../sessions/web/ui/useHarnessCapabilities";
import { HarnessMenu, harnessOptions } from "./HarnessMenu";

export function HarnessDropdownButton({
	label,
	disabled,
	onSelect,
}: {
	label: string;
	disabled: boolean;
	onSelect: (kind: string) => void;
}) {
	const options = harnessOptions(useHarnessCapabilities());
	const anchorRef = useRef<HTMLButtonElement>(null);
	const [open, setOpen] = useState(false);
	const stop = (event: MouseEvent) => event.stopPropagation();
	if (options.length === 0) return null;
	return (
		<>
			<Tooltip title={label}>
				<span>
					<IconButton
						ref={anchorRef}
						aria-label={label}
						size="small"
						disabled={disabled}
						onClick={(event) => {
							stop(event);
							setOpen(true);
						}}
					>
						<ArrowDropDownIcon />
					</IconButton>
				</span>
			</Tooltip>
			<HarnessMenu
				anchorEl={anchorRef.current}
				open={open}
				onClose={() => setOpen(false)}
				options={options}
				onSelect={(kind) => {
					setOpen(false);
					onSelect(kind);
				}}
				stop={stop}
			/>
		</>
	);
}
