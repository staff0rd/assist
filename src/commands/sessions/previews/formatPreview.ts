import { askCheckInputSchema } from "../shared/askCheckInputSchema";
import type { PrPreview } from "../shared/SessionInfoBase";
import { parseQuestions } from "../shared/parseQuestions";

function questionLines(body: string): string[] | undefined {
	const questions = parseQuestions(body);
	if (!questions) return undefined;
	return questions.flatMap((q, i) => [
		`${i + 1}. [${q.header}] ${q.question}${q.multiSelect ? " (choose any)" : ""}`,
		...(q.context ? [`   ${q.context}`] : []),
		...q.options.map(
			(o) => `   - ${o.label}${o.description ? `: ${o.description}` : ""}`,
		),
	]);
}

function checkLines(body: string): string[] | undefined {
	try {
		const parsed = askCheckInputSchema.safeParse(JSON.parse(body));
		if (!parsed.success) return undefined;
		const { before, steps, changed } = parsed.data;
		return [
			...(changed ? [`Changed: ${changed}`] : []),
			...(before?.length ? [`Before: ${before.join("; ")}`] : []),
			...steps.map((step, i) => `${i + 1}. ${step}`),
		];
	} catch {
		return undefined;
	}
}

function bodyLines(preview: PrPreview): string[] {
	if (preview.kind === "question")
		return questionLines(preview.body) ?? [preview.body];
	if (preview.kind === "check")
		return checkLines(preview.body) ?? [preview.body];
	return [preview.body];
}

export function formatPreview(preview: PrPreview): string[] {
	return [
		`Kind: ${preview.kind ?? "pr"}`,
		`Title: ${preview.title}`,
		"",
		...bodyLines(preview),
	];
}
