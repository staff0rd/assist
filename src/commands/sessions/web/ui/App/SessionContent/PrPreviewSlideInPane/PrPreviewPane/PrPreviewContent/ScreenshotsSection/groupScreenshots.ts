import type { LocalScreenshot } from "../../useScreenshots";

export function groupScreenshots(screenshots: LocalScreenshot[]) {
	const groups = new Map<string, LocalScreenshot[]>();
	const ungrouped: LocalScreenshot[] = [];
	for (const s of screenshots) {
		if (!s.group) {
			ungrouped.push(s);
			continue;
		}
		groups.set(s.group, [...(groups.get(s.group) ?? []), s]);
	}
	return { groups: [...groups], ungrouped };
}
