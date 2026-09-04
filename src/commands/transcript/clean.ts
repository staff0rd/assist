import { existsSync } from "node:fs";
import { cuesToChatMessages, formatChatLog } from "./convert/formatChatLog";
import { formatVtt } from "./convert/formatVtt";
import { readCleanedCues } from "./convert/readCleanedCues";
import type { VttCue } from "./types";

const FORMATS = ["md", "vtt"] as const;

type CleanFormat = (typeof FORMATS)[number];

type CleanOptions = {
	format?: string;
	timestamps?: boolean;
};

function isCleanFormat(value: string): value is CleanFormat {
	return (FORMATS as readonly string[]).includes(value);
}

function serialise(
	cues: VttCue[],
	format: CleanFormat,
	timestamps: boolean,
): string {
	return format === "vtt"
		? formatVtt(cues)
		: formatChatLog(cuesToChatMessages(cues), { timestamps });
}

export function clean(file: string, options: CleanOptions = {}): void {
	const format = options.format ?? "md";
	if (!isCleanFormat(format)) {
		console.error(
			`Error: --format must be one of: ${FORMATS.join(", ")} (got: ${format})`,
		);
		process.exit(1);
	}

	const timestamps = options.timestamps ?? false;
	if (timestamps && format !== "md") {
		console.error(
			`Error: --timestamps applies only to --format md (got: ${format})`,
		);
		process.exit(1);
	}

	if (!existsSync(file)) {
		console.error(`Error: VTT file not found: ${file}`);
		process.exit(1);
	}

	const cues = readCleanedCues(file);
	if (cues.length === 0) {
		console.error(`Error: no cues found in: ${file}`);
		process.exit(1);
	}

	console.log(serialise(cues, format, timestamps));
}
