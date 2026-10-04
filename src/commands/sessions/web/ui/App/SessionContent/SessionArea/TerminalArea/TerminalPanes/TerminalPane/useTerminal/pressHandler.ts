import type { Ownership } from "../../Ownership";

export function pressHandler(
	ownership: Ownership,
	takeOver: () => void,
	fit: () => void,
): (() => void) | undefined {
	if (ownership === "other") return takeOver;
	return ownership === "free" ? fit : undefined;
}
