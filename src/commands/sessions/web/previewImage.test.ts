import type { IncomingMessage, ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const ghAuthTokenMock = vi.fn();
vi.mock("./ghAuthToken", () => ({
	ghAuthToken: (...args: unknown[]) => ghAuthTokenMock(...args),
}));

import { previewImage } from "./previewImage";

const ASSET =
	"https://github.com/user-attachments/assets/039b4674-1960-4ce0-ab64-a4bd5d721ae9";
const SIGNED = "https://github-production-user-asset.s3.amazonaws.com/x?sig=y";

function makeReq(url: string): IncomingMessage {
	return { url } as unknown as IncomingMessage;
}

function makeRes() {
	const res = {
		status: 0,
		headers: {} as Record<string, string>,
		body: null as unknown,
		writeHead(status: number, headers?: Record<string, string>) {
			res.status = status;
			Object.assign(res.headers, headers ?? {});
			return res;
		},
		end(payload?: string) {
			res.body = payload ? JSON.parse(payload) : null;
		},
	};
	return res as typeof res & ServerResponse;
}

function request(url: string) {
	return `/api/pr-preview/image?url=${encodeURIComponent(url)}`;
}

describe("previewImage", () => {
	beforeEach(() => {
		ghAuthTokenMock.mockReset().mockResolvedValue("gho_token");
		vi.unstubAllGlobals();
	});

	it("redirects to the signed asset location GitHub hands back", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			headers: new Headers({ location: SIGNED }),
		});
		vi.stubGlobal("fetch", fetchMock);
		const res = makeRes();

		await previewImage(makeReq(`${request(ASSET)}&cwd=/repo`), res);

		expect(fetchMock).toHaveBeenCalledWith(ASSET, {
			headers: { Authorization: "Bearer gho_token" },
			redirect: "manual",
		});
		expect(ghAuthTokenMock).toHaveBeenCalledWith("/repo");
		expect(res.status).toBe(302);
		expect(res.headers.Location).toBe(SIGNED);
		expect(res.headers["Cache-Control"]).toBe("no-store");
	});

	it("refuses a url that is not a GitHub attachment", async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
		const res = makeRes();

		await previewImage(makeReq(request("https://evil.test/steal")), res);

		expect(res.status).toBe(400);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("reports a missing GitHub token rather than fetching unauthenticated", async () => {
		ghAuthTokenMock.mockRejectedValue(new Error("not logged in"));
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
		const res = makeRes();

		await previewImage(makeReq(request(ASSET)), res);

		expect(res.status).toBe(502);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("reports an attachment GitHub will not hand over", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({ headers: new Headers() }),
		);
		const res = makeRes();

		await previewImage(makeReq(request(ASSET)), res);

		expect(res.status).toBe(404);
	});
});
