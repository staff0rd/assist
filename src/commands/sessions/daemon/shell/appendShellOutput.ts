import type { SdkShellChunk, SdkShellRow } from "../../shared/SdkShellRow";

const MAX_OUTPUT = 200_000;
const TRUNCATED = "\n… output truncated\n";

function outputLength(row: SdkShellRow): number {
	return row.output.reduce((total, chunk) => total + chunk.text.length, 0);
}

export function appendShellOutput(
	row: SdkShellRow,
	stream: SdkShellChunk["stream"],
	text: string,
): void {
	const room = MAX_OUTPUT - outputLength(row);
	if (room <= 0) return;
	const kept = text.length > room ? `${text.slice(0, room)}${TRUNCATED}` : text;
	const last = row.output.at(-1);
	if (last?.stream === stream) last.text += kept;
	else row.output.push({ stream, text: kept });
}
