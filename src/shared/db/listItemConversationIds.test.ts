import { describe, expect, it } from "vitest";
import { createTestDb } from "./createTestDb";
import { listItemConversationIds } from "./listItemConversationIds";
import { items, phaseSessions, phaseUsage } from "./schema";

describe("listItemConversationIds", () => {
	it("lists every phase conversation of the item once, in phase order", async () => {
		const { orm } = await createTestDb();
		const [item, other] = await orm
			.insert(items)
			.values([
				{ origin: "github.com/acme/app", name: "Cards", status: "in-progress" },
				{ origin: "github.com/acme/app", name: "Other", status: "todo" },
			])
			.returning({ id: items.id });
		const session = { hostname: "host", osUser: "me" };
		await orm.insert(phaseSessions).values([
			{ itemId: item.id, phaseIdx: 2, claudeSessionId: "review", ...session },
			{ itemId: item.id, phaseIdx: 0, claudeSessionId: "phase-1", ...session },
			{
				itemId: other.id,
				phaseIdx: 0,
				claudeSessionId: "elsewhere",
				...session,
			},
		]);
		await orm.insert(phaseUsage).values([
			{ itemId: item.id, phaseIdx: 0, claudeSessionId: "phase-1" },
			{ itemId: item.id, phaseIdx: 1, claudeSessionId: "phase-2" },
		]);

		expect(await listItemConversationIds(orm, item.id)).toEqual([
			"phase-1",
			"review",
			"phase-2",
		]);
	});
});
