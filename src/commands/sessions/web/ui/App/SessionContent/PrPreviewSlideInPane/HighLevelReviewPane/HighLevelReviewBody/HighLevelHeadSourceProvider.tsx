import { type ReactNode, useMemo } from "react";
import { cachedHeadSource } from "../../../../diffGaps/cachedHeadSource";
import { headSourceContext } from "../../../../diffGaps/headSourceContext";
import { fetchHeadFile } from "./HighLevelHeadSourceProvider/fetchHeadFile";

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
		() =>
			repo && headSha
				? cachedHeadSource("GitHub", (path) =>
						fetchHeadFile(repo, headSha, path),
					)
				: undefined,
		[repo, headSha],
	);
	return (
		<headSourceContext.Provider value={source}>
			{children}
		</headSourceContext.Provider>
	);
}
