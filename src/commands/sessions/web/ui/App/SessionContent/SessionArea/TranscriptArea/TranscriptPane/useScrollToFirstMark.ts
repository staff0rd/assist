import { useEffect, useRef } from "react";
import type { TranscriptMessage } from "../../../../../types";

const BOTTOM_SLACK_PX = 40;

export function useScrollToFirstMark(
	messages: TranscriptMessage[],
	term: string,
	follow?: boolean,
) {
	const ref = useRef<HTMLDivElement>(null);
	const atBottom = useRef(true);

	useEffect(() => {
		const el = ref.current;
		if (!el || !follow) return;
		const onScroll = () => {
			atBottom.current =
				el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_SLACK_PX;
		};
		el.addEventListener("scroll", onScroll);
		return () => el.removeEventListener("scroll", onScroll);
	});

	useEffect(() => {
		if (follow && ref.current) {
			// why: a refetch must not pull the reader back down while they read earlier rows
			if (atBottom.current) ref.current.scrollTop = ref.current.scrollHeight;
			return;
		}
		if (term && messages.length > 0)
			ref.current?.querySelector("mark")?.scrollIntoView({ block: "center" });
	}, [messages, term, follow]);

	return ref;
}
