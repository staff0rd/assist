import type { PreviewTitleLink } from "../shared/SessionInfoBase";

export function parsePreviewTitleLink(
	value: unknown,
): PreviewTitleLink | undefined {
	const { reference, url } = (value ?? {}) as Record<string, unknown>;
	if (typeof reference !== "string" || typeof url !== "string")
		return undefined;
	return { reference, url };
}
