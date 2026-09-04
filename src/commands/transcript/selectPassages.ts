import { failTranscript } from "./failTranscript";
import type { KeepRange, Selection } from "./selectionSchema";
import type { VttCue, VttPassage, VttSource } from "./types";

const CLOCK = /^(?:(\d{1,3}):)?(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?$/;

function describeRange(range: KeepRange): string {
	return `${range.from} --> ${range.to} in ${range.file}`;
}

function parseClock(value: string, range: KeepRange): number {
	const match = value.match(CLOCK);
	if (!match) {
		failTranscript(
			`malformed timestamp "${value}" in selection range ${describeRange(range)}`,
		);
	}
	const [, hours, minutes, seconds, millis] = match;
	return (
		(Number(hours ?? 0) * 3600 + Number(minutes) * 60 + Number(seconds)) *
			1000 +
		Number((millis ?? "").padEnd(3, "0"))
	);
}

function findSource(sources: VttSource[], range: KeepRange): VttSource {
	const match = sources.find(
		(source) => source.path === range.file || source.name === range.file,
	);
	return (
		match ??
		failTranscript(`selection names a file that was not given: ${range.file}`)
	);
}

function spanOf(source: VttSource): { startMs: number; endMs: number } {
	return {
		startMs: source.cues[0].startMs,
		endMs: Math.max(...source.cues.map((cue) => cue.endMs)),
	};
}

function boundsOf(
	source: VttSource,
	range: KeepRange,
): { fromMs: number; toMs: number } {
	const fromMs = parseClock(range.from, range);
	const toMs = parseClock(range.to, range);
	if (toMs < fromMs) {
		failTranscript(
			`selection range ${describeRange(range)} ends before it starts`,
		);
	}

	const span = spanOf(source);
	if (fromMs > span.endMs || toMs < span.startMs) {
		failTranscript(
			`selection range ${describeRange(range)} lies outside that file's cues`,
		);
	}
	return { fromMs, toMs };
}

function cuesInRange(source: VttSource, range: KeepRange): VttCue[] {
	const { fromMs, toMs } = boundsOf(source, range);
	return source.cues.filter(
		(cue) => cue.startMs >= fromMs && cue.startMs <= toMs,
	);
}

function toPassage(source: VttSource, cues: VttCue[]): VttPassage {
	return { source: source.name, sourceStartMs: cues[0].startMs, cues };
}

export function selectPassages(
	sources: VttSource[],
	selection: Selection,
): VttPassage[] {
	const passages = selection.keep.flatMap((range) => {
		const source = findSource(sources, range);
		const cues = cuesInRange(source, range);
		return cues.length ? [toPassage(source, cues)] : [];
	});

	if (passages.length === 0) {
		failTranscript("selection kept no cues from any source");
	}
	return passages;
}
