import { type Pinned, pinToBottom } from "./pinToBottom";

const BOTTOM_SLACK_PX = 40;

export function pinWhileAtBottom(
	el: HTMLDivElement,
	atBottom: { current: boolean },
	pinned: Pinned,
): () => void {
	const pin = () => {
		if (atBottom.current) pinToBottom(el, pinned);
	};
	// why: the scroll event from our own pin lands after later content growth, which would read as the reader leaving the bottom
	const onScroll = () => {
		if (el.scrollTop === pinned.current) return;
		pinned.current = null;
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
