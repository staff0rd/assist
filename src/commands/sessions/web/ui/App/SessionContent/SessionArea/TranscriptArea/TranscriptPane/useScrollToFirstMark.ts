import { useEffect, useRef } from "react";
import type { TranscriptMessage } from "../../../../../types";

export function useScrollToFirstMark(
	messages: TranscriptMessage[],
	term: string,
	follow?: boolean,
) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (follow && ref.current) {
			ref.current.scrollTop = ref.current.scrollHeight;
			return;
		}
		if (term && messages.length > 0)
			ref.current?.querySelector("mark")?.scrollIntoView({ block: "center" });
	}, [messages, term, follow]);

	return ref;
}
