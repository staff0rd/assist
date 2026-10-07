import { type ReactNode, useMemo } from "react";
import {
	languageForPath,
	refractorHighlighter,
} from "../../../../../../../refractorHighlighter";
import { renderHighlighted } from "./useHighlightedSource/renderHighlighted";

export function useHighlightedSource(
	source: string | undefined,
	path: string,
): ReactNode {
	return useMemo(() => {
		const language = languageForPath(path);
		if (source === undefined || !language) return source;
		try {
			return renderHighlighted(
				refractorHighlighter.highlight(source, language),
			);
		} catch {
			return source;
		}
	}, [source, path]);
}
