import { type ChildProcess, spawn } from "node:child_process";
import { join } from "node:path";
import { docsPaths } from "./docsPaths";
import { watchPreviewInputs } from "./preview/watchPreviewInputs";

const docsDir = join(docsPaths.repoRoot, "docs");

function startAstro(): ChildProcess {
	return spawn(
		process.execPath,
		[
			join(docsDir, "node_modules/astro/bin/astro.mjs"),
			"dev",
			"--port",
			"4173",
			"--host",
			"--force",
		],
		{ cwd: docsDir, stdio: "inherit" },
	);
}

function hasExited(child: ChildProcess): boolean {
	return child.exitCode !== null || child.signalCode !== null;
}

export function previewDocs(): void {
	let astro = startAstro();
	let restarting = false;
	watchPreviewInputs(() => {
		if (restarting) return;
		restarting = true;
		console.log("Docs pages, screenshots or schema changed; restarting");
		const next = () => {
			astro = startAstro();
			restarting = false;
		};
		if (hasExited(astro)) return next();
		astro.once("exit", next);
		astro.kill();
	});
	for (const signal of ["SIGINT", "SIGTERM"] as const)
		process.on(signal, () => {
			astro.kill(signal);
			process.exit();
		});
}

previewDocs();
