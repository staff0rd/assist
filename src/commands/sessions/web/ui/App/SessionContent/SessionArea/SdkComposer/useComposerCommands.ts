import type { SlashCommand } from "../../../../../slashCommands/readSlashCommands";
import { useSuggestedSlashCommands } from "../../../../slashSuggestions/useSuggestedSlashCommands";
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
	return shell ? NO_COMMANDS : suggested;
}
