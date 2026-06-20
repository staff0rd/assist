import type { NetcapEntry } from "./types";

export function parseNetcapEntry(body: string): NetcapEntry | null {
	try {
		const parsed = JSON.parse(body) as unknown;
		if (typeof parsed !== "object" || parsed === null) return null;
		return parsed as NetcapEntry;
	} catch {
		return null;
	}
}
