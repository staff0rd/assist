import type { SlashCommand } from "../../slashCommands/readSlashCommands";
import { useShellMode } from "../App/SessionContent/SessionArea/SdkComposer/useShellMode";
import { useSlashReply } from "./PhoneSlashSuggestions/useSlashReply";

const NO_COMMANDS: SlashCommand[] = [];

type ReplyTargets = {
	onSend: (text: string) => void;
	onRunShell?: (command: string) => void;
	locked?: string;
	suggestion?: string;
};

export function useShellReply(
	commands: SlashCommand[],
	draftSessionId: string | undefined,
	{ onSend, onRunShell, locked, suggestion }: ReplyTargets,
) {
	const shell = useShellMode(Boolean(onRunShell));
	const reply = useSlashReply(
		shell.shell ? NO_COMMANDS : commands,
		draftSessionId,
	);
	const pendingSuggestion =
		shell.shell || locked || reply.text ? undefined : suggestion;
	const send = () => {
		const text = reply.text || pendingSuggestion || "";
		if (!text.trim() || locked) return;
		if (shell.shell) {
			onRunShell?.(text.trim());
			shell.leave();
		} else onSend(text);
		reply.clear();
	};
	return { reply, shell, send, pendingSuggestion };
}
