import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { extensionDir } from "./extensionDir";
import { latestUpdate } from "./latestUpdate";

type UpdateUrlManifest = {
	browser_specific_settings: { gecko: { update_url: string } };
};

export type LatestSignedExtension = {
	updateUrl: string;
	latest?: { version: string; update_link: string };
};

export async function fetchLatestSignedExtension(): Promise<LatestSignedExtension> {
	const manifest = await readFile(
		join(extensionDir(), "manifest.json"),
		"utf8",
	);
	const updateUrl = (JSON.parse(manifest) as UpdateUrlManifest)
		.browser_specific_settings.gecko.update_url;
	const response = await fetch(updateUrl, {
		signal: AbortSignal.timeout(10_000),
	});
	if (!response.ok) return { updateUrl };
	return { updateUrl, latest: latestUpdate(manifest, await response.text()) };
}
