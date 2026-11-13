import ButtonBase from "@mui/material/ButtonBase";
import type { MouseEvent } from "react";
import type { SlashCommand } from "../../slashCommands/readSlashCommands";
import { useHighlightScroll } from "../useHighlightScroll";
import { SlashCommandLabel } from "./SlashCommandLabel";
import { slashSuggestionListSx as sx } from "./slashSuggestionListSx";

const keepFocus = (e: MouseEvent) => e.preventDefault();

export function SlashSuggestionRow({
	command,
	query,
	highlighted,
	onPick,
}: {
	command: SlashCommand;
	query: string;
	highlighted: boolean;
	onPick: (name: string) => void;
}) {
	const ref = useHighlightScroll(highlighted);
	return (
		<ButtonBase
			ref={ref}
			component="li"
			role="option"
			aria-selected={highlighted}
			tabIndex={-1}
			sx={{ ...sx.row, ...(highlighted && sx.highlighted) }}
			onMouseDown={keepFocus}
			onClick={() => onPick(command.name)}
		>
			<SlashCommandLabel command={command} query={query} />
		</ButtonBase>
	);
}
