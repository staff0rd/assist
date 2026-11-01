import { z } from "zod";
import { isoWeekRange, isValidWeek } from "../isoWeek";

const oneLine = z
	.string()
	.trim()
	.min(1)
	.refine((value) => !value.includes("\n"), "must be a single line");

const isoDate = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, "must be a date like 2026-08-10");

const MAX_ITEM_LENGTH = 80;

const itemText = oneLine.refine(
	(value) => value.length <= MAX_ITEM_LENGTH,
	`must be a short changelog phrase (at most ${MAX_ITEM_LENGTH} characters)`,
);

const changeItems = z
	.array(z.object({ text: itemText, version: oneLine.optional() }).strict())
	.default([]);

function datesWithinWeek(
	week: string,
	dates: { first: string; last: string },
): boolean {
	if (!isValidWeek(week)) return true;
	const { start, end } = isoWeekRange(week);
	return start <= dates.first && dates.first <= dates.last && dates.last <= end;
}

export const devEntryInputSchema = z
	.object({
		week: z.string().refine(isValidWeek, "must be an ISO week like 2026-W33"),
		title: oneLine,
		dates: z.object({ first: isoDate, last: isoDate }).strict(),
		versions: z.object({ first: oneLine, last: oneLine }).strict().optional(),
		aiGenerated: oneLine,
		added: changeItems,
		changed: changeItems,
		fixed: changeItems,
		lede: z.string().trim().min(1),
	})
	.strict()
	.refine((entry) => datesWithinWeek(entry.week, entry.dates), {
		message: "first and last must be in order and within the week",
		path: ["dates"],
	})
	.refine(
		(entry) =>
			entry.versions !== undefined ||
			[...entry.added, ...entry.changed, ...entry.fixed].every(
				(item) => item.version === undefined,
			),
		{
			message: "items must not have a version when versions is omitted",
			path: ["versions"],
		},
	);

export type DevEntryInput = z.infer<typeof devEntryInputSchema>;
