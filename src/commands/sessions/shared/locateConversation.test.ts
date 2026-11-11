import { describe, expect, it, vi } from "vitest";
import { unsupported } from "../../../shared/harnessAdapters/unsupported";

const locate = {
	claude: vi.fn(async (_id: string): Promise<string | null> => null),
	codex: vi.fn(async (_id: string): Promise<string | null> => null),
	pi: vi.fn(async (_id: string): Promise<string | null> => "/pi/never"),
};

vi.mock("../../../shared/harnessAdapters/harnessAdapter", () => ({
	harnessAdapter: (kind: "claude" | "codex" | "pi") => ({
		capabilities: {
			"transcript.read":
				kind === "pi"
					? unsupported("cannot read", "pick another")
					: { supported: true },
		},
		conversation: {
			reader: { headBytes: 1, kind },
			locate: locate[kind],
		},
	}),
}));

import { locateConversation } from "./locateConversation";

describe("locateConversation", () => {
	it("returns the first harness whose reader locates the conversation", async () => {
		locate.codex.mockResolvedValueOnce("/codex/rollout.jsonl");
		expect(await locateConversation("c1")).toEqual({
			reader: { headBytes: 1, kind: "codex" },
			filePath: "/codex/rollout.jsonl",
		});
		expect(locate.claude).toHaveBeenCalledWith("c1");
	});

	it("skips harnesses that cannot read transcripts", async () => {
		expect(await locateConversation("p1")).toBeUndefined();
		expect(locate.pi).not.toHaveBeenCalled();
	});
});
