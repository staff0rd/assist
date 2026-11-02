import type {
	CheckPreview,
	LaterPhase,
} from "../../../../../../shared/askCheckInputSchema";

function strings(value: unknown): string[] {
	return Array.isArray(value)
		? value.filter((item): item is string => typeof item === "string")
		: [];
}

function laterPhases(value: unknown): LaterPhase[] {
	if (!Array.isArray(value)) return [];
	return value.filter(
		(item): item is LaterPhase =>
			typeof item?.number === "number" && typeof item?.name === "string",
	);
}

export function parseCheckPreview(body: string): CheckPreview {
	try {
		const parsed = JSON.parse(body) as Partial<
			Record<keyof CheckPreview, unknown>
		>;
		return {
			title: typeof parsed?.title === "string" ? parsed.title : "",
			steps: strings(parsed?.steps),
			before: strings(parsed?.before),
			...(typeof parsed?.changed === "string"
				? { changed: parsed.changed }
				: {}),
			laterPhases: laterPhases(parsed?.laterPhases),
		};
	} catch {
		return { title: "", steps: [], before: [], laterPhases: [] };
	}
}
