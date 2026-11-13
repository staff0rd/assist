import { compareByLastActivity } from "./compareByLastActivity";
import { discoverCodexHistoryEntries } from "./codex/discoverCodexHistoryEntries";
import type { HistoryEntry } from "./HistoryEntry";
import { loadSessionTitles } from "./loadSessionTitles";
import { parseSessionFile } from "./parseSessionFile";
import { discoverSessionJsonlPaths } from "./discoverSessionJsonlPaths";

export async function discoverHistoryEntries(): Promise<HistoryEntry[]> {
	const paths = await discoverSessionJsonlPaths();
	const entries: HistoryEntry[] = [];

	await Promise.all(
		paths.map(async ({ path: filePath, origin }) => {
			const session = await parseSessionFile(filePath, origin);
			if (session) entries.push({ session, filePath });
		}),
	);
	entries.push(...(await discoverCodexHistoryEntries()));

	const titles = loadSessionTitles();
	for (const { session } of entries) {
		const title = titles[session.sessionId];
		if (title) session.title = title;
	}

	entries.sort((a, b) => compareByLastActivity(a.session, b.session));
	return entries;
}
