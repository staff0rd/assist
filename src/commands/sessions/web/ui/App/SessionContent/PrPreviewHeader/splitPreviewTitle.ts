import type { PrPreview } from "../../../../../shared/SessionInfoBase";
import { type TitleWithRef, splitGithubRef } from "./splitGithubRef";

export function splitPreviewTitle({
	title,
	titleLink,
}: Pick<PrPreview, "title" | "titleLink">): TitleWithRef | null {
	const index = titleLink ? title.indexOf(titleLink.reference) : -1;
	if (!titleLink || index < 0) return splitGithubRef(title);
	return {
		before: title.slice(0, index),
		reference: titleLink.reference,
		url: titleLink.url,
		after: title.slice(index + titleLink.reference.length),
	};
}
