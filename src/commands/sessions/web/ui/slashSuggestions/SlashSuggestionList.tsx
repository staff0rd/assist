import Box from "@mui/material/Box";
import type { SlashCommand } from "../../slashCommands/readSlashCommands";
import { SlashSuggestionRow } from "./SlashSuggestionRow";
import { slashSuggestionListSx as sx } from "./slashSuggestionListSx";

export type SlashSuggestions = {
	query: string;
	matches: SlashCommand[];
	highlight: number;
};

export function SlashSuggestionList({
	suggestions,
	onPick,
	floating = false,
}: {
	suggestions: SlashSuggestions;
	onPick: (name: string) => void;
	floating?: boolean;
}) {
	return (
		<Box
			component="ul"
			role="listbox"
			aria-label="Skill suggestions"
			sx={{ ...sx.list, ...(floating && sx.floating) }}
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
