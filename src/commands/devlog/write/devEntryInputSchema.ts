import { z } from "zod";
import { isValidWeek } from "../isoWeek";

const oneLine = z
	.string()
	.trim()
	.min(1)
	.refine((value) => !value.includes("\n"), "must be a single line");

const changeItems = z
	.array(z.object({ text: oneLine, version: oneLine.optional() }).strict())
	.default([]);

export const devEntryInputSchema = z
	.object({
		week: z.string().refine(isValidWeek, "must be an ISO week like 2026-W33"),
		title: oneLine,
		versions: z.object({ first: oneLine, last: oneLine }).strict().optional(),
		aiGenerated: oneLine,
		added: changeItems,
		changed: changeItems,
		fixed: changeItems,
		lede: z.string().trim().min(1),
	})
	.strict();

export type DevEntryInput = z.infer<typeof devEntryInputSchema>;
