import type { ToolInputField } from "./types";

export function toolInputFields(
	input: Record<string, unknown>,
): ToolInputField[] {
	return Object.entries(input)
		.filter(([, value]) => value !== undefined && value !== null)
		.map(([name, value]) => ({
			name,
			value: typeof value === "string" ? value : JSON.stringify(value),
		}));
}
