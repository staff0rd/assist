import { docsFeedbackMarkers } from "../../shared/docsFeedbackMarkers";
import type { ChangedSource } from "./changedDocsPages";

type SidebarEntry =
	| {
			type: "link";
			label: string;
			href: string;
			attrs: Record<string, unknown>;
	  }
	| { type: "group"; entries: SidebarEntry[] };

export type ChangedPage = ChangedSource & { href: string; label: string };

function pageIdOfHref(href: string, base: string): string {
	const path = href.startsWith(base) ? href.slice(base.length) : href;
	return path.replace(/^\/+|\/+$/g, "") || "index";
}

function* sidebarLinks(
	entries: SidebarEntry[],
): Generator<Extract<SidebarEntry, { type: "link" }>> {
	for (const entry of entries) {
		if (entry.type === "group") yield* sidebarLinks(entry.entries);
		else yield entry;
	}
}

export function markChangedPages(
	sidebar: SidebarEntry[],
	sources: ChangedSource[],
	base: string,
): ChangedPage[] {
	const changed = new Map(sources.map((source) => [source.id, source.version]));
	const pages: ChangedPage[] = [];
	for (const link of sidebarLinks(sidebar)) {
		const id = pageIdOfHref(link.href, base);
		const version = changed.get(id);
		if (version === undefined) continue;
		link.attrs[docsFeedbackMarkers.changedAttribute] = "";
		pages.push({ id, version, href: link.href, label: link.label });
		changed.delete(id);
	}
	const root = base.endsWith("/") ? base : `${base}/`;
	for (const [id, version] of changed)
		pages.push({
			id,
			version,
			href: id === "index" ? root : `${root}${id}/`,
			label: id,
		});
	return pages;
}
