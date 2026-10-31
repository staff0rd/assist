import { docsFeedbackMarkers } from "../../shared/docsFeedbackMarkers";

type SidebarEntry =
	| {
			type: "link";
			label: string;
			href: string;
			attrs: Record<string, unknown>;
	  }
	| { type: "group"; entries: SidebarEntry[] };

export type ChangedPage = { id: string; href: string; label: string };

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
	changedIds: string[],
	base: string,
): ChangedPage[] {
	const changed = new Set(changedIds);
	const pages: ChangedPage[] = [];
	for (const link of sidebarLinks(sidebar)) {
		const id = pageIdOfHref(link.href, base);
		if (!changed.has(id)) continue;
		link.attrs[docsFeedbackMarkers.changedAttribute] = "";
		pages.push({ id, href: link.href, label: link.label });
		changed.delete(id);
	}
	const root = base.endsWith("/") ? base : `${base}/`;
	for (const id of changed)
		pages.push({
			id,
			href: id === "index" ? root : `${root}${id}/`,
			label: id,
		});
	return pages;
}
