import type { PreviewAttachment } from "./PreviewAttachment";

export function toAttachments(value: unknown): PreviewAttachment[] | undefined {
	if (!Array.isArray(value)) return undefined;
	return value.flatMap((entry) => {
		const { path, alt, group } = (entry ?? {}) as Record<string, unknown>;
		if (typeof path !== "string" || path === "") return [];
		const attachment = { path, alt: typeof alt === "string" ? alt : "" };
		return [
			typeof group === "string" && group !== ""
				? { ...attachment, group }
				: attachment,
		];
	});
}
