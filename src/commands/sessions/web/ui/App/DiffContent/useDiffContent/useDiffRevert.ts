import { useCallback, useState } from "react";
import { postDiffRevert } from "./useDiffRevert/postDiffRevert";
import {
	type DiffRevertFailure,
	postDiffRevertAll,
} from "./useDiffRevert/postDiffRevertAll";

function failureSummary(failed: DiffRevertFailure[]): string {
	const label = failed.length === 1 ? "file" : "files";
	return `Failed to revert ${failed.length} ${label}: ${failed
		.map((failure) => `${failure.path} (${failure.error})`)
		.join(", ")}`;
}

export function useDiffRevert(
	cwd: string,
	enabled: boolean,
	refresh: () => void,
): {
	onRevert?: (path: string) => void;
	onRevertPaths?: (paths: string[]) => void;
	error: string | null;
	clearError: () => void;
} {
	const [error, setError] = useState<string | null>(null);

	const onRevert = useCallback(
		(path: string) => {
			postDiffRevert(cwd, path)
				.then(refresh)
				.catch((error: unknown) =>
					setError(
						error instanceof Error ? error.message : "Failed to revert file",
					),
				);
		},
		[cwd, refresh],
	);

	const onRevertPaths = useCallback(
		(paths: string[]) => {
			postDiffRevertAll(cwd, paths)
				.then((failed) => {
					refresh();
					if (failed.length > 0) setError(failureSummary(failed));
				})
				.catch((error: unknown) =>
					setError(
						error instanceof Error ? error.message : "Failed to revert files",
					),
				);
		},
		[cwd, refresh],
	);

	return {
		onRevert: enabled ? onRevert : undefined,
		onRevertPaths: enabled ? onRevertPaths : undefined,
		error,
		clearError: () => setError(null),
	};
}
