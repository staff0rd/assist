import { type ReactNode, useMemo } from "react";
import { reportCaughtError } from "../../../../../clientFailures/reportCaughtError";
import { fetchHeadFile } from "./HighLevelHeadSourceProvider/fetchHeadFile";
import {
	type HighLevelHeadSource,
	highLevelHeadSourceContext,
} from "../../highLevelHeadSourceContext";

function cachedHeadSource(repo: string, sha: string): HighLevelHeadSource {
	const files = new Map<string, Promise<string[]>>();
	return {
		load: (path) => {
			const cached = files.get(path);
			if (cached) return cached;
			const loading = fetchHeadFile(repo, sha, path);
			files.set(path, loading);
			loading.catch((error: unknown) => {
				reportCaughtError(error, `head file ${path}`);
				files.delete(path);
			});
			return loading;
		},
	};
}

export function HighLevelHeadSourceProvider({
	repo,
	headSha,
	children,
}: {
	repo: string;
	headSha: string;
	children: ReactNode;
}) {
	const source = useMemo(
		() => (repo && headSha ? cachedHeadSource(repo, headSha) : undefined),
		[repo, headSha],
	);
	return (
		<highLevelHeadSourceContext.Provider value={source}>
			{children}
		</highLevelHeadSourceContext.Provider>
	);
}
