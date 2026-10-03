import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { stampManifestVersion } from "./stampManifestVersion";

export async function stageCriteriaExtension(
	source: string,
	staging: string,
	version: string,
): Promise<void> {
	await rm(staging, { recursive: true, force: true });
	await mkdir(staging, { recursive: true });
	await cp(source, staging, {
		recursive: true,
		filter: (path) => basename(path) !== "updates.json",
	});
	const manifest = join(staging, "manifest.json");
	const stamped = stampManifestVersion(
		await readFile(manifest, "utf8"),
		version,
	);
	await writeFile(manifest, stamped);
}
