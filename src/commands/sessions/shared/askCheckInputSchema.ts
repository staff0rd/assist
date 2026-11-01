import { z } from "zod";

const text = z.string().trim().min(1);

export const askCheckInputSchema = z.object({
	title: text,
	steps: z.array(text).min(1, "Give at least 1 step"),
	before: z.array(text).optional(),
	changed: text.optional(),
});

export type AskCheckInput = z.infer<typeof askCheckInputSchema>;

export const CHECK_RESULT_KEY = "result";
export const CHECK_NOTE_KEY = "note";

export type CheckResult = "works" | "doesn't work";
