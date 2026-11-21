import { useEffect, useLayoutEffect, useRef } from "react";
import type { TranscriptMessage } from "../../../../../types";

const BOTTOM_SLACK_PX = 40;

function pinWhileAtBottom(
	el: HTMLDivElement,
	atBottom: { current: boolean },
): () => void {
	const pin = () => {
		if (atBottom.current) el.scrollTop = el.scrollHeight;
	};
	const onScroll = () => {
		atBottom.current =
			el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_SLACK_PX;
	};
	el.addEventListener("scroll", onScroll);
	const observer =
		typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(pin);
	observer?.observe(el);
	if (el.firstElementChild) observer?.observe(el.firstElementChild);
	return () => {
		el.removeEventListener("scroll", onScroll);
		observer?.disconnect();
	};
}

export function useScrollToFirstMark(
	messages: TranscriptMessage[],
	term: string,
	follow?: boolean,
) {
	const ref = useRef<HTMLDivElement>(null);
	const atBottom = useRef(true);

	useLayoutEffect(() => {
		const el = ref.current;
		if (!el || !follow) return;
		return pinWhileAtBottom(el, atBottom);
	});

	useLayoutEffect(() => {
		const el = ref.current;
		if (follow && el && atBottom.current) el.scrollTop = el.scrollHeight;
	}, [messages, follow]);

	useEffect(() => {
		if (!follow && term && messages.length > 0)
			ref.current?.querySelector("mark")?.scrollIntoView({ block: "center" });
	}, [messages, term, follow]);

	return ref;
}
