import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { getHtml } from "../getHtml";

const require = createRequire(import.meta.url);
const WEB_DIR = "ios-app/www";
const BUNDLE_DIR = "dist/commands/sessions/web";
const ICON_DIR = "dist/commands/extension/extension/icons";
const BUNDLE_FILES = [
	"bundle.js",
	"bundle.css",
	"monaco.js",
	"monaco.worker.js",
	"monaco.css",
];

export function buildIosWeb(): void {
	rmSync(WEB_DIR, { recursive: true, force: true });
	mkdirSync(WEB_DIR, { recursive: true });
	for (const file of BUNDLE_FILES)
		cpSync(join(BUNDLE_DIR, file), join(WEB_DIR, file));
	cpSync(
		require.resolve("@xterm/xterm/css/xterm.css"),
		join(WEB_DIR, "xterm.css"),
	);
	for (const size of [16, 32, 128])
		cpSync(
			join(ICON_DIR, `assist-${size}.png`),
			join(WEB_DIR, `favicon-${size}.png`),
		);
	writeFileSync(
		join(WEB_DIR, "index.html"),
		getHtml().replace(
			"initial-scale=1.0",
			"initial-scale=1.0, maximum-scale=1.0",
		),
	);
	console.log(`iOS web assets written to ${WEB_DIR}`);
}

buildIosWeb();
