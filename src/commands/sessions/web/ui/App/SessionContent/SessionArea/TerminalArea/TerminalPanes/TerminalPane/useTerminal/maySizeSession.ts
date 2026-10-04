import type { Ownership } from "../../Ownership";

export function maySizeSession(
	ownership: Ownership,
	visible: boolean,
	focused: boolean,
): boolean {
	if (ownership === "mine") return true;
	return ownership === "free" && visible && focused;
}
