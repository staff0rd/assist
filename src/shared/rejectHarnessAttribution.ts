import { findHarnessAttribution } from "./findHarnessAttribution";

export function rejectHarnessAttribution(label: string, text: string): void {
	const phrase = findHarnessAttribution(text);
	if (!phrase) return;
	console.error(
		`Error: ${label} must not contain coding-agent attribution ("${phrase}")`,
	);
	process.exit(1);
}
