import { type ReviewerHarness, reviewerHarnesses } from "./reviewerHarnesses";

export type FindingSource =
	| "confirmed"
	| "disputed"
	| `${ReviewerHarness}-only`
	| "already-raised";

export const findingSourceValues: readonly FindingSource[] = [
	"confirmed",
	"disputed",
	...reviewerHarnesses.map((harness) => `${harness}-only` as const),
	"already-raised",
];

export const findingSourceEnum = findingSourceValues.join(" | ");
