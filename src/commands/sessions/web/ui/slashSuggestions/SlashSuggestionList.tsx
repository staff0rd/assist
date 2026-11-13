import Box from "@mui/material/Box";
import type { SlashCommand } from "../../slashCommands/readSlashCommands";
import { SlashSuggestionRow } from "./SlashSuggestionRow";
import { slashSuggestionListSx as sx } from "./slashSuggestionListSx";

type SlashSuggestions = {
	query: string;
	matches: SlashCommand[];
	highlight: number;
};

export function SlashSuggestionList({
	suggestions,
	onPick,
}: {
	suggestions: SlashSuggestions;
	onPick: (name: string) => void;
}) {
	return (
		<Box
			component="ul"
			role="listbox"
			aria-label="Skill suggestions"
			sx={sx.list}
		>
			{suggestions.matches.map((command, i) => (
				<SlashSuggestionRow
					key={`${command.scope}:${command.name}`}
					command={command}
					query={suggestions.query}
					highlighted={i === suggestions.highlight}
					onPick={onPick}
				/>
			))}
		</Box>
	);
}
