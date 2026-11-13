import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import type { PointerEvent } from "react";
import type { SlashCommand } from "../../../slashCommands/readSlashCommands";
import { SlashCommandLabel } from "../../slashSuggestions/SlashCommandLabel";
import { phoneSlashSuggestionsSx as sx } from "./phoneSlashSuggestionsSx";

const keepKeyboardOpen = (e: PointerEvent) => e.preventDefault();

type Props = {
	matches: SlashCommand[];
	query: string;
	onPick: (name: string) => void;
};

export function PhoneSlashSuggestions({ matches, query, onPick }: Props) {
	return (
		<Box sx={sx.list} role="listbox" aria-label="Skill suggestions">
			{matches.map((command, i) => (
				<ButtonBase
					key={`${command.scope}:${command.name}`}
					role="option"
					aria-selected={i === 0}
					sx={{ ...sx.row, ...(i === 0 && sx.first) }}
					onPointerDown={keepKeyboardOpen}
					onClick={() => onPick(command.name)}
				>
					<SlashCommandLabel command={command} query={query} />
				</ButtonBase>
			))}
		</Box>
	);
}
