import { spawn } from "node:child_process";
import { closeSync, openSync, rmSync } from "node:fs";
import { join } from "node:path";
import type { DocsEdit } from "../docsPageSchema";
import { findFreePort } from "./findFreePort";
import { stageDocsSite } from "./stageDocsSite";
import { waitForHttp } from "./waitForHttp";

const READY_TIMEOUT_MS = 120_000;

type DocsPreview = { url: string; stop: () => Promise<void> };

export async function startDocsPreview(
	page: string,
	edits: DocsEdit[],
): Promise<DocsPreview> {
	const root = stageDocsSite(page, edits);
	const docsDir = join(root, "docs");
	const port = await findFreePort();
	const url = `http://localhost:${port}`;
	const log = join(root, "astro.log");
	const logFd = openSync(log, "a");
	const astro = spawn(
		process.execPath,
		[
			join(docsDir, "node_modules/astro/bin/astro.mjs"),
			"dev",
			"--port",
			String(port),
			"--ignore-lock",
		],
		{ cwd: docsDir, stdio: ["ignore", logFd, logFd] },
	);
	closeSync(logFd);
	const exited = new Promise<void>((resolve) => astro.once("exit", resolve));
	const stop = async () => {
		astro.kill();
		await exited;
		rmSync(root, { recursive: true, force: true, maxRetries: 5 });
	};
	try {
		await waitForHttp(`${url}/${page}/`, log, {
			label: "Docs preview",
			timeoutMs: READY_TIMEOUT_MS,
		});
	} catch (error) {
		await stop();
		throw error;
	}
	return { url, stop };
}
