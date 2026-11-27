export type Pinned = { current: number | null };

export function pinToBottom(el: HTMLDivElement, pinned: Pinned) {
	el.scrollTop = el.scrollHeight;
	pinned.current = el.scrollTop;
}
