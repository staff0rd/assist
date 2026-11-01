import { useMemo } from "react";
import { usePolledGitStatus } from "../../usePolledGitStatus";
import { type UncommittedFiles, uncommittedFiles } from "../uncommittedFiles";

export function useUncommittedFiles(
	cwd: string,
	sessionId: string | undefined,
	enabled: boolean,
): { files: UncommittedFiles | undefined; refresh: () => void } {
	const { counts, refresh } = usePolledGitStatus(cwd, sessionId, enabled);
	const files = useMemo(
		() => (enabled ? uncommittedFiles(counts) : undefined),
		[enabled, counts],
	);
	return { files, refresh };
}
