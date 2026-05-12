export type SpinnerState = "running" | "succeeded" | "failed";

export type SpinnerEntry = {
	state: SpinnerState;
	text: string;
	footer?: boolean;
	elapsedStart?: number;
	elapsedPrefix?: string;
};

export const SPINNER_FRAMES = [
	"⠋",
	"⠙",
	"⠹",
	"⠸",
	"⠼",
	"⠴",
	"⠦",
	"⠧",
	"⠇",
	"⠏",
];

function refreshElapsedText(entry: SpinnerEntry): void {
	if (entry.elapsedStart === undefined || entry.state !== "running") return;
	const seconds = Math.round((Date.now() - entry.elapsedStart) / 1000);
	entry.text = `${entry.elapsedPrefix ?? "elapsed"}: ${seconds}s`;
}

export function renderEntries(entries: SpinnerEntry[], frame: number): string {
	const sorted = [...entries].sort(
		(a, b) => Number(Boolean(a.footer)) - Number(Boolean(b.footer)),
	);
	for (const entry of sorted) refreshElapsedText(entry);
	return sorted.map((e) => renderEntry(e, frame)).join("\n");
}

function renderEntry(entry: SpinnerEntry, frame: number): string {
	if (entry.state === "succeeded") return `✔ ${entry.text}`;
	if (entry.state === "failed") return `✖ ${entry.text}`;
	return `${SPINNER_FRAMES[frame]} ${entry.text}`;
}
