import { docsFeedbackMarkers } from "../../shared/docsFeedbackMarkers";
import type { ChangedPage } from "./markChangedPages";

type PreviewPage = {
	id: string;
	title: string;
	source: string;
	changedPages?: ChangedPage[];
};

function meta(name: string, content: string) {
	return { tag: "meta" as const, attrs: { name, content }, content: "" };
}

export function previewPageMeta(page: PreviewPage) {
	const metas = [
		meta(docsFeedbackMarkers.pageMeta, page.id),
		meta(docsFeedbackMarkers.titleMeta, page.title),
		meta(docsFeedbackMarkers.sourceMeta, page.source),
	];
	if (page.changedPages?.length)
		metas.push(
			meta(docsFeedbackMarkers.changesMeta, JSON.stringify(page.changedPages)),
		);
	return metas;
}
