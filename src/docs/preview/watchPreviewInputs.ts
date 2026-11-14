import { watch } from "node:fs";
import { basename, dirname, join } from "node:path";
import { docsPaths } from "../docsPaths";
import { docsSidebar } from "../starlight/docsSidebar";

function readSidebar(): string | undefined {
	try {
		return JSON.stringify(docsSidebar());
	} catch {
		return undefined;
	}
}

export function watchPreviewInputs(onChange: () => void): void {
	let sidebar = readSidebar();
	let timer: NodeJS.Timeout | undefined;
	const schedule = () => {
		clearTimeout(timer);
		timer = setTimeout(onChange, 300);
	};
	watch(docsPaths.pagesDir, (_event, name) => {
		if (!name?.endsWith(".md")) return;
		const next = readSidebar();
		if (next === undefined || next === sidebar) return;
		sidebar = next;
		schedule();
	});
	watch(docsPaths.screenshotsDir, (_event, name) => {
		if (name?.endsWith(".png")) schedule();
	});
	watch(
		join(docsPaths.repoRoot, "src/docs"),
		{ recursive: true },
		(_event, name) => {
			if (name?.endsWith(".ts") && !name.endsWith(".test.ts")) schedule();
		},
	);
	watch(dirname(docsPaths.captureScenes), (_event, name) => {
		if (name === basename(docsPaths.captureScenes)) schedule();
	});
}
