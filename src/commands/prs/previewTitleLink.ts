import type { PreviewTitleLink } from "../sessions/shared/SessionInfoBase";

export function previewTitleLink(
	reference: string,
	url: string | undefined,
): PreviewTitleLink | undefined {
	return url ? { reference, url } : undefined;
}
