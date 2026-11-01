import type { AskCheckInput } from "../../../../../../shared/askCheckInputSchema";

function strings(value: unknown): string[] {
	return Array.isArray(value)
		? value.filter((item): item is string => typeof item === "string")
		: [];
}

export function parseCheckPreview(body: string): AskCheckInput {
	try {
		const parsed = JSON.parse(body) as Partial<
			Record<keyof AskCheckInput, unknown>
		>;
		return {
			title: typeof parsed?.title === "string" ? parsed.title : "",
			steps: strings(parsed?.steps),
			before: strings(parsed?.before),
			...(typeof parsed?.changed === "string"
				? { changed: parsed.changed }
				: {}),
		};
	} catch {
		return { title: "", steps: [], before: [] };
	}
}
