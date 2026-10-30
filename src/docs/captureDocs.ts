import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { parseArgs } from "node:util";
import { captureScreenshots } from "./capture/captureScreenshots";
import { requireDocker } from "./capture/requireDocker";
import { withCaptureEnvironment } from "./capture/withCaptureEnvironment";
import type { DocsScreenshot } from "./docsPageSchema";
import { docsPaths } from "./docsPaths";
import { findUnknownScenes } from "./findUnknownScenes";
import { type CaptureScenes, loadCaptureScenes } from "./loadCaptureScenes";
import { loadDocsPages } from "./loadDocsPages";

function selectScreenshots(only: string[], scenes: CaptureScenes) {
	const pages = loadDocsPages(docsPaths.pagesDir);
	const unknown = findUnknownScenes(pages, scenes);
	if (unknown.length > 0)
		throw new Error(`Unknown capture scenes:\n  ${unknown.join("\n  ")}`);
	const screenshots = pages.flatMap((page) => page.screenshots ?? []);
	const selected =
		only.length === 0
			? screenshots
			: screenshots.filter((screenshot) => only.includes(screenshot.file));
	return selected.sort((a, b) => stateKey(a).localeCompare(stateKey(b)));
}

function stateKey(screenshot: DocsScreenshot): string {
	return JSON.stringify([screenshot.scene ?? "", screenshot.setup ?? []]);
}

function build(): void {
	const result = spawnSync("npm", ["run", "build"], {
		cwd: docsPaths.repoRoot,
		stdio: "inherit",
		shell: process.platform === "win32",
	});
	if (result.status !== 0) process.exit(result.status ?? 1);
}

export async function captureDocs(argv: string[]): Promise<void> {
	const { values, positionals } = parseArgs({
		args: argv,
		allowPositionals: true,
		options: {
			"skip-build": { type: "boolean", default: false },
			"keep-home": { type: "boolean", default: false },
		},
	});
	const scenes = loadCaptureScenes(docsPaths.captureScenes);
	const screenshots = selectScreenshots(positionals, scenes);
	if (screenshots.length === 0) {
		console.log("No screenshots declared to capture");
		return;
	}
	requireDocker();
	if (!values["skip-build"]) build();
	mkdirSync(docsPaths.screenshotsDir, { recursive: true });

	await withCaptureEnvironment(values["keep-home"], ({ capture, url }) =>
		captureScreenshots(capture, url, screenshots, scenes),
	);
}

captureDocs(process.argv.slice(2)).catch((error: Error) => {
	console.error(error.message);
	process.exit(1);
});
