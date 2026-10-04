import type { PreviewAttachment } from "../sessions/shared/PreviewAttachment";

export function attachArgs(attachments: PreviewAttachment[]): string[] {
	return attachments.flatMap(({ path, alt }) => [
		"--attach",
		alt ? `${path}#${alt}` : path,
	]);
}
