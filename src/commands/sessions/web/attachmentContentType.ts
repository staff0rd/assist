import { extname } from "node:path";
import { attachmentMimeTypes } from "./attachmentMimeTypes";

export function attachmentContentType(path: string): string {
	const ext = extname(path).replace(/^\./, "").toLowerCase();
	const match = Object.entries(attachmentMimeTypes).find(([, e]) => e === ext);
	return match?.[0] ?? "application/octet-stream";
}
