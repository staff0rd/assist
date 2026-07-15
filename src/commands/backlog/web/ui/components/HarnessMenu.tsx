import { Menu, MenuItem } from "@mui/material";
import type { MouseEvent } from "react";

type HarnessOption = { kind: string; label: string };

export function harnessOptions(capabilities: {
	exposeCodexActions: boolean;
	exposePiActions: boolean;
}): HarnessOption[] {
	const options: HarnessOption[] = [];
	if (capabilities.exposeCodexActions)
		options.push({ kind: "codex", label: "with Codex" });
	if (capabilities.exposePiActions)
		options.push({ kind: "pi", label: "with pi" });
	return options;
}

export function HarnessMenu({
	anchorEl,
	open,
	onClose,
	options,
	onSelect,
	stop,
}: {
	anchorEl: HTMLElement | null;
	open: boolean;
	onClose: () => void;
	options: HarnessOption[];
	onSelect: (kind: string) => void;
	stop: (event: MouseEvent) => void;
}) {
	return (
		<Menu anchorEl={anchorEl} open={open} onClose={onClose} onClick={stop}>
			{options.map((option) => (
				<MenuItem
					key={option.kind}
					onClick={(event) => {
						stop(event);
						onSelect(option.kind);
					}}
				>
					{option.label}
				</MenuItem>
			))}
		</Menu>
	);
}
