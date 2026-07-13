import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleLaunchSignal } from "./handleLaunchSignal";
import { next } from "./next";
import { readSignal } from "./readSignal";
import { cleanupSignal } from "./resolvePhaseResult";
import { surfaceCreatedItem } from "./surfaceCreatedItem";
import { tryRunById } from "./tryRunById";

vi.mock("./readSignal", () => ({ readSignal: vi.fn() }));
vi.mock("./resolvePhaseResult", () => ({ cleanupSignal: vi.fn() }));
vi.mock("./surfaceCreatedItem", () => ({ surfaceCreatedItem: vi.fn() }));
vi.mock("./tryRunById", () => ({ tryRunById: vi.fn() }));
vi.mock("./next", () => ({ next: vi.fn() }));

const readSignalMock = readSignal as unknown as ReturnType<typeof vi.fn>;
const surfaceCreatedItemMock = surfaceCreatedItem as unknown as ReturnType<
	typeof vi.fn
>;
const tryRunByIdMock = tryRunById as unknown as ReturnType<typeof vi.fn>;
const nextMock = next as unknown as ReturnType<typeof vi.fn>;

describe("handleLaunchSignal", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		readSignalMock.mockReturnValue(undefined);
		tryRunByIdMock.mockResolvedValue(false);
		nextMock.mockResolvedValue(undefined);
	});

	it("cleans up the signal and surfaces a created item on a done signal", async () => {
		readSignalMock.mockReturnValue({ event: "done", id: "42" });

		await handleLaunchSignal("draft");

		expect(cleanupSignal).toHaveBeenCalledOnce();
		expect(surfaceCreatedItemMock).toHaveBeenCalledWith("draft", "42");
	});

	it("does not crash when a DB/DNS blip throws during surfacing", async () => {
		readSignalMock.mockReturnValue({ event: "done", id: "42" });
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		surfaceCreatedItemMock.mockRejectedValue(
			new Error("getaddrinfo ENOTFOUND aws.pooler.supabase.com"),
		);

		await expect(handleLaunchSignal("draft")).resolves.toBeUndefined();

		expect(errorSpy).toHaveBeenCalledWith(
			expect.stringContaining("transient database/network blip"),
		);
		errorSpy.mockRestore();
	});

	it("does not crash when chaining into next throws", async () => {
		readSignalMock.mockReturnValue({ event: "next" });
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		nextMock.mockRejectedValue(new Error("getaddrinfo ENOTFOUND pooler"));

		await expect(handleLaunchSignal("next")).resolves.toBeUndefined();

		expect(errorSpy).toHaveBeenCalledWith(
			expect.stringContaining("transient database/network blip"),
		);
		errorSpy.mockRestore();
	});
});
