import Popper from "@mui/material/Popper";
import type { Theme } from "@mui/material/styles";
import {
	SlashSuggestionList,
	type SlashSuggestions,
} from "./SlashSuggestionList";

const popperSx = { zIndex: (t: Theme) => t.zIndex.modal + 1 };

export function SlashSuggestionPopper({
	anchor,
	suggestions,
	onPick,
}: {
	anchor: HTMLElement | null;
	suggestions: SlashSuggestions;
	onPick: (name: string) => void;
}) {
	return (
		<Popper
			open={Boolean(anchor)}
			anchorEl={anchor}
			placement="bottom-start"
			sx={{ ...popperSx, width: anchor?.clientWidth }}
		>
			<SlashSuggestionList floating suggestions={suggestions} onPick={onPick} />
		</Popper>
	);
}
