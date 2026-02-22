import { resolveEntries } from "./run/resolveEntries";

export function list(): void {
	const entries = resolveEntries();
	if (entries.length === 0) {
		console.error("No verify commands found");
		process.exit(1);
	}
	for (const entry of entries) {
		console.log(`${entry.name}: ${entry.fullCommand}`);
	}
}
