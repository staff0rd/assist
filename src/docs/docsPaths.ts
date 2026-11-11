import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export const docsPaths = {
	repoRoot,
	agentDir: join(repoRoot, "agent"),
	appRoutes: join(
		repoRoot,
		"src/commands/sessions/web/ui/App/AppShell/AppRoutes.tsx",
	),
	pagesDir: join(repoRoot, "docs/src/content/docs"),
	screenshotsDir: join(repoRoot, "docs/public/screenshots"),
	socialCard: join(repoRoot, "docs/public/og.png"),
	captureConfig: join(repoRoot, "docs/capture/assist.yml"),
	captureScenes: join(repoRoot, "docs/capture/scenes.json"),
	captureBin: join(repoRoot, "docs/capture/bin"),
	captureScripts: join(repoRoot, "docs/capture/github"),
	extensionDir: join(repoRoot, "extension"),
	distEntry: join(repoRoot, "dist/index.js"),
};
