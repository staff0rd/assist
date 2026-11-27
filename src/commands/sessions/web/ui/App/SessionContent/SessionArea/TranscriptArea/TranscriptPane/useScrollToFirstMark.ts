import { useEffect, useLayoutEffect, useRef } from "react";
import type { TranscriptMessage } from "../../../../../types";
import { pinToBottom } from "./pinToBottom";
import { pinWhileAtBottom } from "./pinWhileAtBottom";

export function useScrollToFirstMark(
	messages: TranscriptMessage[],
	term: string,
	follow?: boolean,
	followSignal?: number,
) {
	const ref = useRef<HTMLDivElement>(null);
	const atBottom = useRef(true);
	const pinned = useRef<number | null>(null);

	useLayoutEffect(() => {
		const el = ref.current;
		if (!el || !follow) return;
		return pinWhileAtBottom(el, atBottom, pinned);
	});

	useLayoutEffect(() => {
		const el = ref.current;
		if (follow && el && atBottom.current) pinToBottom(el, pinned);
	}, [messages, follow]);

	useLayoutEffect(() => {
		const el = ref.current;
		if (!follow || !el || !followSignal) return;
		atBottom.current = true;
		pinToBottom(el, pinned);
	}, [followSignal, follow]);

	useEffect(() => {
		if (!follow && term && messages.length > 0)
			ref.current?.querySelector("mark")?.scrollIntoView({ block: "center" });
	}, [messages, term, follow]);

	return ref;
}
