import { isAbsolute, relative, resolve, sep } from "node:path";
import { stagedAttachmentsDir } from "./stagedAttachmentsDir";

export function isStagedAttachmentPath(path: string): boolean {
	const rel = relative(stagedAttachmentsDir, resolve(path));
	return (
		rel !== "" &&
		rel !== ".." &&
		!rel.startsWith(`..${sep}`) &&
		!isAbsolute(rel)
	);
}
