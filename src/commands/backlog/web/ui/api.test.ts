import { afterEach, describe, expect, it, vi } from "vitest";
import { setApiBase } from "../../../sessions/web/ui/apiUrl";
import { updateItemStatus } from "./api";

vi.mock(
	"../../../sessions/web/ui/clientFailures/requestFailureRecorder",
	() => ({
		requestFailureRecorder: () => () => {},
	}),
);

afterEach(() => {
	setApiBase("");
	vi.unstubAllGlobals();
});

describe("updateItemStatus", () => {
	it("sends the request to the configured API base", async () => {
		const fetchMock = vi.fn(async () => Response.json({ id: 1 }));
		vi.stubGlobal("fetch", fetchMock);
		setApiBase("https://host.ts.net:3100");

		await updateItemStatus(1372, "done", "/repo", "wsl");

		expect(fetchMock).toHaveBeenCalledWith(
			"https://host.ts.net:3100/api/items/a1372?cwd=%2Frepo&node=wsl",
			expect.objectContaining({ method: "PATCH" }),
		);
	});

	it("rejects when the server responds with an error", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => Response.json({ error: "nope" }, { status: 500 })),
		);

		await expect(updateItemStatus(1372, "done")).rejects.toThrow(/500/);
	});
});
