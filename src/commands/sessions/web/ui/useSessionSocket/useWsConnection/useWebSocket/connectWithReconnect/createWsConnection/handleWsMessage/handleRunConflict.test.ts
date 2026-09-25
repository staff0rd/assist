import { describe, expect, it, vi } from "vitest";
import { handleRunConflict } from "./handleRunConflict";
import type { WsDispatch } from "../../../WsDispatch";

function dispatch(): WsDispatch & {
	setServerConflict: ReturnType<typeof vi.fn>;
} {
	return { setServerConflict: vi.fn() } as unknown as WsDispatch & {
		setServerConflict: ReturnType<typeof vi.fn>;
	};
}

describe("handleRunConflict", () => {
	it("carries the conflicting server's group to the replace prompt", () => {
		const d = dispatch();

		handleRunConflict(
			{
				type: "run-conflict",
				runName: "api-alt",
				cwd: "/b",
				existing: {
					id: "1",
					name: "run: api",
					cwd: "/a",
					port: 3000,
					group: "api",
				},
			},
			d,
		);

		expect(d.setServerConflict).toHaveBeenCalledWith({
			existing: {
				id: "1",
				name: "run: api",
				cwd: "/a",
				port: 3000,
				group: "api",
			},
			runName: "api-alt",
			cwd: "/b",
			sessionId: undefined,
			launchedFrom: undefined,
		});
	});
});
