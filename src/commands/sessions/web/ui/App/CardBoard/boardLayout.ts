export type BoardLayout = "full" | "narrow";

export function boardLayout(paneOpen: boolean): BoardLayout {
	return paneOpen ? "narrow" : "full";
}
