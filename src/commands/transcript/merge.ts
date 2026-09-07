import { existsSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import { readJsonPayload } from "../backlog/readJsonPayload";
import { formatVttPassages } from "./convert/formatVtt";
import { readCleanedCues } from "./convert/readCleanedCues";
import { failTranscript } from "./failTranscript";
import { headerNotes } from "./headerNotes";
import { rebasePassages } from "./rebasePassages";
import { selectPassages } from "./selectPassages";
import { type Selection, selectionSchema } from "./selectionSchema";
import { widenAudience } from "./widenAudience";
import type { VttPassage, VttSource } from "./types";

type MergeOptions = {
	out?: string;
	select?: string;
	provenance?: boolean;
	widenAudience?: boolean;
};

function readSource(file: string): VttSource {
	if (!existsSync(file)) failTranscript(`VTT file not found: ${file}`);
	const cues = readCleanedCues(file);
	if (cues.length === 0) failTranscript(`no cues found in: ${file}`);
	return { path: file, name: basename(file), cues };
}

function wholePassages(sources: VttSource[]): VttPassage[] {
	return sources.map((source) => ({
		source: source.name,
		sourceStartMs: source.cues[0].startMs,
		cues: source.cues,
	}));
}

async function readSelection(
	source: string | undefined,
): Promise<Selection | undefined> {
	if (!source) return undefined;
	return readJsonPayload(source, selectionSchema, "transcript selection");
}

export async function merge(
	files: string[],
	options: MergeOptions = {},
): Promise<void> {
	const sources = files.map(readSource);
	const selection = await readSelection(options.select);
	const selected = selection
		? selectPassages(sources, selection)
		: wholePassages(sources);
	const passages = rebasePassages(
		options.widenAudience ? widenAudience(selected) : selected,
	);
	const provenance = options.provenance !== false;
	const document = formatVttPassages(
		passages,
		provenance ? headerNotes(sources, selection?.removed ?? []) : [],
		{ sourceMarks: provenance },
	);

	if (!options.out) {
		console.log(document);
		return;
	}

	writeFileSync(options.out, `${document}\n`, "utf8");
	console.log(`Merged transcript: ${options.out}`);
}
