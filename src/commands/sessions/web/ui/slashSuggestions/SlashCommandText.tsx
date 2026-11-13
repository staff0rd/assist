import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { Fragment, type ReactNode } from "react";
import type { SlashCommand } from "../../slashCommands/readSlashCommands";
import { splitSlashCommands } from "./splitSlashCommands";

export function SlashCommandText({
	text,
	commands,
	commandSx,
	renderText = (t) => t,
}: {
	text: string;
	commands: SlashCommand[];
	commandSx: SxProps<Theme>;
	renderText?: (text: string) => ReactNode;
}) {
	return splitSlashCommands(text, commands).map((s) =>
		s.command ? (
			<Box component="span" key={s.start} sx={commandSx}>
				{renderText(s.text)}
			</Box>
		) : (
			<Fragment key={s.start}>{renderText(s.text)}</Fragment>
		),
	);
}
