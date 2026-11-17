import { useMemo } from "react";
import type { SlashCommand } from "../../../../../slashCommands/readSlashCommands";
import { useSuggestedSlashCommands } from "../../../../slashSuggestions/useSuggestedSlashCommands";
import { withBuiltInSlashCommands } from "../../../../slashSuggestions/withBuiltInSlashCommands";
import type { SessionInfo } from "../../../../types";

const NO_COMMANDS: SlashCommand[] = [];

export function useComposerCommands(
	session: SessionInfo,
	shell: boolean,
): SlashCommand[] {
	const suggested = useSuggestedSlashCommands(
		session.harness,
		session.cwd,
		session.node,
	);
	const commands = useMemo(
		() => withBuiltInSlashCommands(session.harness, suggested),
		[session.harness, suggested],
	);
	return shell ? NO_COMMANDS : commands;
}
