import { statSync } from "node:fs";
import { basename, extname, resolve } from "node:path";
import type { PreviewAttachment } from "../sessions/shared/PreviewAttachment";
import { ghAttachableExtensions } from "../sessions/web/ghAttachableExtensions";

function splitOnce(value: string, separator: string): [string, string] | null {
	const index = value.indexOf(separator);
	if (index === -1) return null;
	return [value.slice(0, index), value.slice(index + separator.length)];
}

function isFile(path: string): boolean {
	try {
		return statSync(path).isFile();
	} catch {
		return false;
	}
}

export function parseScreenshotSpec(spec: string): PreviewAttachment {
	const [label, rawPath] = splitOnce(spec, "=") ?? ["", spec];
	const [group, caption] = splitOnce(label, "/") ?? ["", label];
	const path = resolve(rawPath.trim());
	const ext = extname(path).replace(/^\./, "").toLowerCase();

	if (!isFile(path))
		throw new Error(`--screenshot '${spec}': file not found: ${path}`);
	if (!ghAttachableExtensions.has(ext))
		throw new Error(
			`--screenshot '${spec}': gh cannot attach .${ext || "(none)"} files (supported: ${[...ghAttachableExtensions].join(", ")}).`,
		);

	const alt = caption.trim() || basename(path, extname(path));
	return group.trim() ? { path, alt, group: group.trim() } : { path, alt };
}
