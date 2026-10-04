import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { stagedAttachmentsDir } from "../../../shared/stagedAttachmentsDir";
import { attachmentMimeTypes } from "./attachmentMimeTypes";

function extensionFromMime(contentType: string): string | undefined {
	const mime = contentType.split(";")[0].trim().toLowerCase();
	const known = attachmentMimeTypes[mime];
	if (known) return known;
	const subtype = mime.split("/")[1]?.replace(/^x-/, "").replace(/\+.*$/, "");
	return subtype && /^[a-z0-9]+$/.test(subtype) ? subtype : undefined;
}

function pickExtension(name: string, contentType: string): string {
	const fromName = extname(name).replace(/^\./, "").toLowerCase();
	if (/^[a-z0-9]+$/.test(fromName)) return fromName;
	return extensionFromMime(contentType) ?? "png";
}

function safeBaseName(name: string): string {
	const base = name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]+/g, "-");
	return base.replace(/^-+|-+$/g, "").slice(0, 60) || "screenshot";
}

export async function stageAttachment(
	name: string,
	contentType: string,
	body: Buffer,
): Promise<{ dir: string; filePath: string; alt: string }> {
	await mkdir(stagedAttachmentsDir, { recursive: true });
	const dir = await mkdtemp(join(stagedAttachmentsDir, "upload-"));
	const alt = safeBaseName(name);
	const filePath = join(dir, `${alt}.${pickExtension(name, contentType)}`);
	await writeFile(filePath, body);
	return { dir, filePath, alt };
}
