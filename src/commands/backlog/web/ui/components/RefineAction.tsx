import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import TuneIcon from "@mui/icons-material/Tune";
import { Button, ButtonGroup, Menu, MenuItem } from "@mui/material";
import { type MouseEvent, useRef, useState } from "react";
import { useHarnessCapabilities } from "../../../../sessions/web/ui/useHarnessCapabilities";
import { useRefineLaunch } from "./useRefineLaunch";

export function RefineAction({ itemId }: { itemId: number }) {
	const { launched, launch } = useRefineLaunch(itemId);
	const { exposeCodexActions } = useHarnessCapabilities();
	const anchorRef = useRef<HTMLDivElement>(null);
	const [menuOpen, setMenuOpen] = useState(false);

	const stop = (event: MouseEvent) => event.stopPropagation();

	return (
		<>
			<ButtonGroup
				ref={anchorRef}
				variant="outlined"
				size="small"
				disabled={launched}
			>
				<Button
					startIcon={<TuneIcon />}
					onClick={(event) => {
						stop(event);
						launch([]);
					}}
				>
					Refine
				</Button>
				{exposeCodexActions && (
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
			<Menu
				anchorEl={anchorRef.current}
				open={menuOpen}
				onClose={() => setMenuOpen(false)}
				onClick={stop}
			>
				<MenuItem
					onClick={(event) => {
						stop(event);
						setMenuOpen(false);
						launch(["--harness", "codex"]);
					}}
				>
					with Codex
				</MenuItem>
			</Menu>
		</>
	);
}
