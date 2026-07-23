import { useMemo } from "react";
import { type HunkData, markEdits, tokenize } from "react-diff-view";
import { languageForPath, refractorHighlighter } from "./refractorHighlighter";

export function useDiffTokens(hunks: HunkData[], path: string) {
	return useMemo(() => {
		if (hunks.length === 0) return undefined;
		const language = languageForPath(path);
		const enhancers = [markEdits(hunks, { type: "block" })];
		try {
			return language
				? tokenize(hunks, {
						highlight: true,
						refractor: refractorHighlighter,
						language,
						enhancers,
					})
				: tokenize(hunks, { highlight: false, enhancers });
		} catch {
			return undefined;
		}
	}, [hunks, path]);
}
