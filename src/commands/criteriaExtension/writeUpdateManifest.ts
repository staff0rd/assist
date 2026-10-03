import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildUpdateManifest } from "./buildUpdateManifest";

export async function writeUpdateManifest(
	source: string,
	dir: string,
	version: string,
): Promise<void> {
	await writeFile(
		join(dir, "updates.json"),
		buildUpdateManifest(
			await readFile(join(source, "manifest.json"), "utf8"),
			version,
		),
	);
}
