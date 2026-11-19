import type { PreviewDecision } from "../shared/PreviewDecision";
import {
	CHECK_NOTE_KEY,
	CHECK_RESULT_KEY,
} from "../shared/askCheckInputSchema";
import { parseQuestions } from "../shared/parseQuestions";
import type { PrPreview } from "../shared/SessionInfoBase";
import type { DecideOptions } from "./DecideOptions";
import { parseAnswers } from "./parseAnswers";

function noteOf(value: string | true | undefined): string | undefined {
	return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function questionDecision(
	preview: PrPreview,
	options: DecideOptions,
): PreviewDecision {
	if (options.reject)
		return { decision: "reject", reason: noteOf(options.reject) };
	const questions = parseQuestions(preview.body);
	if (!questions) throw new Error("The pending question form is unreadable");
	if (!options.answer?.length)
		throw new Error("Answer a question form with --answer <choice>");
	return {
		decision: "approve",
		answers: parseAnswers(questions, options.answer),
	};
}

function checkDecision(options: DecideOptions): PreviewDecision {
	const note = noteOf(options.approve ?? options.reject);
	return {
		decision: "approve",
		answers: {
			[CHECK_RESULT_KEY]: options.approve ? "works" : "doesn't work",
			...(note ? { [CHECK_NOTE_KEY]: note } : {}),
		},
	};
}

function reviewDecision(
	preview: PrPreview,
	options: DecideOptions,
): PreviewDecision {
	if (options.reject)
		return { decision: "reject", reason: noteOf(options.reject) };
	const note = noteOf(options.approve);
	return {
		decision: "approve",
		comments: note ? [{ quote: preview.title, note }] : [],
	};
}

export function decisionFor(
	preview: PrPreview,
	options: DecideOptions,
): PreviewDecision {
	const picked = [options.approve, options.reject].filter(Boolean).length;
	if (picked > 1)
		throw new Error("Pass either --approve or --reject, not both");
	if (preview.kind === "question") return questionDecision(preview, options);
	if (options.answer?.length)
		throw new Error(
			`--answer only applies to a question form; this preview is ${preview.kind ?? "pr"}`,
		);
	if (picked === 0) throw new Error("Pass --approve [note] or --reject [note]");
	if (preview.kind === "check") return checkDecision(options);
	return reviewDecision(preview, options);
}
