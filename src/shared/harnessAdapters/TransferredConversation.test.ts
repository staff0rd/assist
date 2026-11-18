import { describe, expect, it } from "vitest";
import { parseTransferredConversation } from "./TransferredConversation";

describe("parseTransferredConversation", () => {
	it("keeps a safe rollout location", () => {
		expect(
			parseTransferredConversation({
				id: "x",
				transcript: "",
				path: ["2026", "11", "09", "rollout-a-x.jsonl"],
			}),
		).toEqual({
			id: "x",
			transcript: "",
			path: ["2026", "11", "09", "rollout-a-x.jsonl"],
		});
	});

	it.each([[[".."]], [["a/b"]], [[String.raw`C:\x`]], [[]], ["2026/11"]])(
		"refuses an unsafe location %j",
		(path) => {
			expect(
				parseTransferredConversation({ id: "x", transcript: "", path }),
			).toBeUndefined();
		},
	);
});
