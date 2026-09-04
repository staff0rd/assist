import { existsSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import { formatVttPassages } from "./convert/formatVtt";
import { readCleanedCues } from "./convert/readCleanedCues";
import type { VttCue, VttPassage } from "./types";

type MergeOptions = {
	out?: string;
};

const JOIN_GAP_MS = 1000;

function fail(message: string): never {
	console.error(`Error: ${message}`);
	process.exit(1);
}

function readSource(file: string): VttPassage {
	if (!existsSync(file)) fail(`VTT file not found: ${file}`);
	const cues = readCleanedCues(file);
	if (cues.length === 0) fail(`no cues found in: ${file}`);
	return { source: basename(file), sourceStartMs: cues[0].startMs, cues };
}

function shift(cues: VttCue[], offsetMs: number): VttCue[] {
	return cues.map((cue) => ({
		...cue,
		startMs: cue.startMs + offsetMs,
		endMs: cue.endMs + offsetMs,
	}));
}

function lastEndMs(cues: VttCue[]): number {
	return Math.max(...cues.map((cue) => cue.endMs));
}

function rebase(passages: VttPassage[]): VttPassage[] {
	let cursorMs = 0;
	return passages.map((passage) => {
		const cues = shift(passage.cues, cursorMs - passage.sourceStartMs);
		cursorMs = lastEndMs(cues) + JOIN_GAP_MS;
		return { ...passage, cues };
	});
}

function headerNotes(sources: string[]): string[] {
	return [
		`Collapsed ${new Date().toISOString().slice(0, 10)} from:`,
		...sources.map((source) => `  ${source}`),
	];
}

export function merge(files: string[], options: MergeOptions = {}): void {
	const passages = rebase(files.map(readSource));
	const document = formatVttPassages(
		passages,
		headerNotes(files.map((file) => basename(file))),
	);

	if (!options.out) {
		console.log(document);
		return;
	}

	writeFileSync(options.out, `${document}\n`, "utf8");
	console.log(`Merged transcript: ${options.out}`);
}
