import { z } from "zod";

const askQuestionOptionSchema = z.object({
	label: z.string().min(1),
	description: z.string(),
	preview: z.string().optional(),
});

const askQuestionSchema = z.object({
	question: z.string().min(1),
	header: z.string().min(1),
	multiSelect: z.boolean(),
	options: z
		.array(askQuestionOptionSchema)
		.min(2, "Each question needs at least 2 options")
		.max(4, "Each question allows at most 4 options")
		.refine(
			(options) =>
				new Set(options.map((option) => option.label)).size === options.length,
			"Option labels must be unique within a question",
		),
});

export const askQuestionInputSchema = z.object({
	questions: z
		.array(askQuestionSchema)
		.min(1, "Ask at least 1 question")
		.max(4, "Ask at most 4 questions")
		.refine(
			(questions) =>
				new Set(questions.map((q) => q.question)).size === questions.length,
			"Question texts must be unique",
		),
});

export type AskQuestionInput = z.infer<typeof askQuestionInputSchema>;

export type AskQuestion = AskQuestionInput["questions"][number];
