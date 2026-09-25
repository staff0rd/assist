import { describe, expect, it, vi } from "vitest";
import { createSessionInStreamAction } from "./createSessionInStreamAction";

describe("createSessionInStreamAction", () => {
	it("launches the added agent in auto mode", () => {
		const send = vi.fn();

		createSessionInStreamAction(send)("3", "go", "/git/repo-2");

		expect(send).toHaveBeenCalledWith({
			type: "create",
			prompt: "go",
			cwd: "/git/repo-2",
			joinSessionId: "3",
			auto: true,
		});
	});
});
