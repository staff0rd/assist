import Box from "@mui/material/Box";
import type { SlashCommand } from "../../slashCommands/readSlashCommands";
import { slashCommandLabelSx as sx } from "./slashCommandLabelSx";

export function SlashCommandLabel({
	command,
	query,
}: {
	command: SlashCommand;
	query: string;
}) {
	return (
		<>
			<Box component="span" sx={sx.name}>
				/
				<Box component="span" sx={sx.match}>
					{command.name.slice(0, query.length)}
				</Box>
				{command.name.slice(query.length)}
				{command.scope === "project" && (
					<Box component="span" sx={sx.scope}>
						project
					</Box>
				)}
			</Box>
			{command.description && (
				<Box component="span" sx={sx.description}>
					{command.description}
				</Box>
			)}
		</>
	);
}
