import { type UIEvent, useRef } from "react";
import type { SlashCommand } from "../../../../../slashCommands/readSlashCommands";
import { splitSlashCommands } from "../../../../slashSuggestions/splitSlashCommands";

export function useComposerBackdrop(
	text: string,
	commands: SlashCommand[],
	enabled: boolean,
) {
	const backdropRef = useRef<HTMLDivElement>(null);
	const active =
		enabled && splitSlashCommands(text, commands).some((s) => s.command);
	const onScroll = (e: UIEvent<HTMLTextAreaElement | HTMLInputElement>) => {
		if (backdropRef.current)
			backdropRef.current.scrollTop = e.currentTarget.scrollTop;
	};
	return { backdropRef, active, onScroll };
}
