export function scrollSessionCardIntoView(id: string): void {
	globalThis.requestAnimationFrame(() => {
		globalThis.document
			.querySelector(`[data-session-id="${id}"]`)
			?.scrollIntoView({ block: "nearest" });
	});
}
