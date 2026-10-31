import { defineRouteMiddleware } from "@astrojs/starlight/route-data";
import { changedDocsPages } from "../../src/docs/starlight/changedDocsPages";
import { markChangedPages } from "../../src/docs/starlight/markChangedPages";
import { previewPageMeta } from "../../src/docs/starlight/previewPageMeta";

export const onRequest = defineRouteMiddleware(({ locals }) => {
	const { entry, sidebar } = locals.starlightRoute;
	const { previewError } = entry.data as { previewError?: string };
	if (previewError)
		throw new Error(`docs/${entry.filePath} frontmatter:\n${previewError}`);
	locals.starlightRoute.head.push(
		...previewPageMeta({
			id: entry.id,
			title: entry.data.title,
			source: `docs/${entry.filePath}`,
			changedPages: markChangedPages(
				sidebar,
				changedDocsPages(),
				import.meta.env.BASE_URL,
			),
		}),
	);
});
