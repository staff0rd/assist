import { readFileSync } from "node:fs";
import { parse } from "yaml";

type StreamsInput = { streams: Record<string, unknown>[] } | { error: string };

function readSource(source: string): string {
	return readFileSync(source === "-" ? 0 : source, "utf8");
}

export function readStreamsInput(source: string): StreamsInput {
	let parsed: unknown;
	try {
		parsed = parse(readSource(source));
	} catch (error) {
		return { error: error instanceof Error ? error.message : String(error) };
	}
	if (!Array.isArray(parsed))
		return { error: `Expected an array of streams, got ${typeof parsed}.` };
	const bad = parsed.findIndex(
		(s) => s === null || typeof s !== "object" || Array.isArray(s),
	);
	if (bad !== -1) return { error: `Stream ${bad} is not an object.` };
	return { streams: parsed as Record<string, unknown>[] };
}
