import {
	type DocsPage,
	type DocsSidebarPage,
	docsNavGroups,
} from "../docsPageSchema";

type DocsNavGroup = {
	group: DocsSidebarPage["group"];
	pages: DocsSidebarPage[];
};

export function orderDocsPages(pages: DocsPage[]): DocsNavGroup[] {
	return docsNavGroups
		.map((group) => ({
			group,
			pages: pages
				.filter(
					(page): page is DocsSidebarPage =>
						"group" in page && page.group === group,
				)
				.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
		}))
		.filter((entry) => entry.pages.length > 0);
}
