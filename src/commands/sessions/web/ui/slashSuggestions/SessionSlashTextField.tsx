import type { ComponentProps } from "react";
import { SlashTextField } from "./SlashTextField";
import { useSessionSlashCommands } from "./useSessionSlashCommands";

export function SessionSlashTextField(
	props: Omit<ComponentProps<typeof SlashTextField>, "commands">,
) {
	const commands = useSessionSlashCommands();
	return <SlashTextField {...props} commands={commands} />;
}
