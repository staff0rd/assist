import { useMemo } from "react";
import type { ConversationTarget } from "../../../../../shared/sessionConversationTarget";
import { usePolledGitStatus } from "../../usePolledGitStatus";
import { type UncommittedFiles, uncommittedFiles } from "../uncommittedFiles";

export function useUncommittedFiles(
	cwd: string,
	conversation: ConversationTarget | undefined,
	enabled: boolean,
): { files: UncommittedFiles | undefined; refresh: () => void } {
	const { counts, refresh } = usePolledGitStatus(cwd, conversation, enabled);
	const files = useMemo(
		() => (enabled ? uncommittedFiles(counts) : undefined),
		[enabled, counts],
	);
	return { files, refresh };
}
