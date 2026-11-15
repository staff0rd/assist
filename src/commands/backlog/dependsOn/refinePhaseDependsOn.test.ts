import { describe, expect, it } from "vitest";
import { proposedItemSchema } from "../propose/proposedItemSchema";
import { planUpdateSchema } from "../updatePlan/planUpdateSchema";

const phase = (dependsOn?: number[]) => ({
	name: "P",
	tasks: ["t"],
	...(dependsOn ? { dependsOn } : {}),
});

function proposalError(phases: object[]): string | undefined {
	const result = proposedItemSchema.safeParse({
		name: "Item",
		type: "story",
		phases,
	});
	return result.success ? undefined : result.error.issues[0].message;
}

describe("phase dependsOn validation", () => {
	it("accepts phases without dependsOn and with earlier references", () => {
		expect(proposalError([phase(), phase(), phase([1])])).toBeUndefined();
		expect(proposalError([phase(), phase([])])).toBeUndefined();
	});

	it("rejects forward, self and unknown references", () => {
		expect(proposalError([phase(), phase([3]), phase()])).toMatch(
			/phase 2 dependsOn 3/,
		);
		expect(proposalError([phase(), phase([2])])).toMatch(/phase 2 dependsOn 2/);
		expect(proposalError([phase([0])])).toMatch(/phase 1 dependsOn 0/);
	});

	it("validates plan updates the same way", () => {
		const result = planUpdateSchema.safeParse({
			phases: [phase(), phase([5])],
		});
		expect(result.success).toBe(false);
	});
});
