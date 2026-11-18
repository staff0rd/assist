export type BoardLayout = "full" | "narrow" | "compact";

export function boardLayout(paneOpen: boolean, sessionShown: boolean) {
	if (!paneOpen) return "full";
	return sessionShown ? "compact" : "narrow";
}
