import type { PreviewAttachment } from "../sessions/shared/PreviewAttachment";
import { attachArgs } from "./attachArgs";

export function buildEditArgs(
	number: number,
	title: string,
	body: string,
	attachments: PreviewAttachment[] = [],
) {
	return [
		"pr",
		"edit",
		String(number),
		"--title",
		title,
		"--body",
		body,
		...attachArgs(attachments),
	];
}
