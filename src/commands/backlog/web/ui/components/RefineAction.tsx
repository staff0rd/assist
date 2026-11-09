import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Button, ButtonGroup } from "@mui/material";
import { type MouseEvent, useRef, useState } from "react";
import { refineFeature } from "../../../../../shared/harnessAdapters/harnessFeatures";
import { useApiNode } from "../../../../sessions/web/ui/useApiNode";
import { useHarnessCapabilities } from "../../../../sessions/web/ui/useHarnessCapabilities";
import { featureHarnessOptions } from "./featureHarnessOptions";
import { HarnessMenu } from "./HarnessMenu";
import { useRefineLaunch } from "./useRefineLaunch";

export function RefineAction({ itemId }: { itemId: number }) {
	const { launched, launch } = useRefineLaunch(itemId);
	const capabilities = useHarnessCapabilities(useApiNode());
	const anchorRef = useRef<HTMLDivElement>(null);
	const [menuOpen, setMenuOpen] = useState(false);

	const stop = (event: MouseEvent) => event.stopPropagation();
	const options = featureHarnessOptions(capabilities, refineFeature.id);

	return (
		<>
			<ButtonGroup
				ref={anchorRef}
				variant="tonal"
				size="small"
				disabled={launched}
			>
				<Button
					onClick={(event) => {
						stop(event);
						launch([]);
					}}
				>
					Refine
				</Button>
				{options.length > 0 && (
					<Button
						size="small"
						aria-label="Refine with a different harness"
						onClick={(event) => {
							stop(event);
							setMenuOpen(true);
						}}
					>
						<ArrowDropDownIcon />
					</Button>
				)}
			</ButtonGroup>
			<HarnessMenu
				anchorEl={anchorRef.current}
				open={menuOpen}
				onClose={() => setMenuOpen(false)}
				options={options}
				onSelect={(kind) => {
					setMenuOpen(false);
					launch(["--harness", kind]);
				}}
				stop={stop}
			/>
		</>
	);
}
