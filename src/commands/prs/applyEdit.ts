import type { PreviewAttachment } from "../sessions/shared/PreviewAttachment";
import { attachArgs } from "./attachArgs";
import { runGhWithAttachments } from "./runGhWithAttachments";

export function applyEdit(
	number: number,
	title: string | undefined,
	body: string,
	attachments: PreviewAttachment[] = [],
): void {
	const args = ["pr", "edit", String(number)];
	if (title) args.push("--title", title);
	args.push("--body", body, ...attachArgs(attachments));

	process.stdout.write(runGhWithAttachments(args, attachments));
}
