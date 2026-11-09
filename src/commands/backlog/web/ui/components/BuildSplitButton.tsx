import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Button, ButtonGroup } from "@mui/material";
import { type MouseEvent, useRef, useState } from "react";
import { BuildSegment } from "./BuildSegment";
import { HarnessMenu } from "./HarnessMenu";
import { useBuildHarnessOptions } from "./useBuildHarnessOptions";

export function BuildSplitButton({
	tooltip,
	disabled,
	onBuild,
	onSelectHarness,
}: {
	tooltip: string;
	disabled: boolean;
	onBuild: () => void;
	onSelectHarness: (kind: string) => void;
}) {
	const options = useBuildHarnessOptions();
	const anchorRef = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);
	const stop = (event: MouseEvent) => event.stopPropagation();
	return (
		<>
			<ButtonGroup
				ref={anchorRef}
				variant="contained"
				color="primary"
				size="small"
				disabled={disabled}
			>
				<BuildSegment
					tooltip={tooltip}
					disabled={disabled}
					onClick={(event) => {
						stop(event);
						onBuild();
					}}
				/>
				{options.length > 0 && (
					<Button
						aria-label="Build with a different harness"
						onClick={(event) => {
							stop(event);
							setOpen(true);
						}}
					>
						<ArrowDropDownIcon />
					</Button>
				)}
			</ButtonGroup>
			<HarnessMenu
				anchorEl={anchorRef.current}
				open={open}
				onClose={() => setOpen(false)}
				options={options}
				onSelect={(kind) => {
					setOpen(false);
					onSelectHarness(kind);
				}}
				stop={stop}
			/>
		</>
	);
}
