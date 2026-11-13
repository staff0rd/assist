import Box from "@mui/material/Box";
import type { Ref } from "react";
import type { SlashCommand } from "../../../../../slashCommands/readSlashCommands";
import { SlashCommandText } from "../../../../slashSuggestions/SlashCommandText";
import { slashHighlightSx } from "../../../../slashSuggestions/slashHighlightSx";
import { sdkComposerSx } from "./sdkComposerSx";

export function SdkComposerBackdrop({
	text,
	commands,
	backdropRef,
}: {
	text: string;
	commands: SlashCommand[];
	backdropRef: Ref<HTMLDivElement>;
}) {
	return (
		<Box ref={backdropRef} aria-hidden sx={sdkComposerSx.backdrop}>
			<SlashCommandText
				text={`${text}​`}
				commands={commands}
				commandSx={slashHighlightSx.inline}
			/>
		</Box>
	);
}
