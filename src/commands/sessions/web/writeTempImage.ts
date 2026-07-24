import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";

const EXT_BY_MIME: Record<string, string> = {
	"image/png": "png",
	"image/jpeg": "jpg",
	"image/gif": "gif",
	"image/webp": "webp",
	"image/svg+xml": "svg",
	"image/bmp": "bmp",
	"image/avif": "avif",
};

function pickExtension(name: string, contentType: string): string {
	const fromName = extname(name).replace(/^\./, "").toLowerCase();
	if (fromName) return fromName;
	return EXT_BY_MIME[contentType.split(";")[0].trim().toLowerCase()] ?? "png";
}

function safeBaseName(name: string): string {
	const base = name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]+/g, "-");
	return base.replace(/^-+|-+$/g, "").slice(0, 60) || "screenshot";
}

export async function writeTempImage(
	name: string,
	contentType: string,
	body: Buffer,
): Promise<{ dir: string; filePath: string }> {
	const dir = await mkdtemp(join(tmpdir(), "assist-pr-img-"));
	const filePath = join(
		dir,
		`${safeBaseName(name)}.${pickExtension(name, contentType)}`,
	);
	await writeFile(filePath, body);
	return { dir, filePath };
}
