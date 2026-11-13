import { remotePrGuidance } from "./remotePrGuidance";

export function linkPrompt(url: string, instructions: unknown): string {
	const extra = typeof instructions === "string" ? instructions.trim() : "";
	const guidance = remotePrGuidance(url);
	const parts = [url];
	if (guidance) parts.push(guidance);
	if (extra) parts.push(extra);
	return parts.join("\n\n");
}
