import { stripAnsi } from "../../../../shared/stripAnsi";
import type { SdkShellChunk } from "../../shared/SdkShellRow";

type Stream = SdkShellChunk["stream"];

const MAX_LINES = 300;
const MAX_LINE_CHARS = 2000;

export function createWorkflowOutputBuffer(
	maxLines = MAX_LINES,
	maxLineChars = MAX_LINE_CHARS,
) {
	const lines: SdkShellChunk[] = [];
	const open: Partial<Record<Stream, SdkShellChunk>> = {};
	const dropOldest = () => {
		const dropped = lines.shift();
		for (const stream of ["stdout", "stderr"] as const)
			if (open[stream] === dropped) open[stream] = undefined;
	};
	return {
		append(stream: Stream, chunk: string) {
			const parts = stripAnsi(chunk).replaceAll("\r", "").split("\n");
			parts.forEach((part, i) => {
				const last = i === parts.length - 1;
				let line = i === 0 ? open[stream] : undefined;
				if (line) line.text = (line.text + part).slice(0, maxLineChars);
				else if (!last || part) {
					line = { stream, text: part.slice(0, maxLineChars) };
					lines.push(line);
				}
				open[stream] = last ? line : undefined;
			});
			while (lines.length > maxLines) dropOldest();
		},
		lines: (): SdkShellChunk[] => lines.map((line) => ({ ...line })),
	};
}
