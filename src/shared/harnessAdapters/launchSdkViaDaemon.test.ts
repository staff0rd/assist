import { afterEach, describe, expect, it, vi } from "vitest";
import { connectToDaemon } from "../../commands/sessions/daemon/connectToDaemon";
import { launchSdkViaDaemon } from "./launchSdkViaDaemon";

vi.mock("../../commands/sessions/daemon/connectToDaemon", () => ({
	connectToDaemon: vi.fn(),
}));

describe("launchSdkViaDaemon", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		process.exitCode = undefined;
	});

	it("refuses outside a driven daemon session without connecting", async () => {
		vi.stubEnv("ASSIST_SDK_SESSION", "");
		const { done } = launchSdkViaDaemon({
			harness: "claude-sdk",
			prompt: "/refine a1",
			cwd: "/r",
		});
		await expect(done).rejects.toThrow(/sessions the assist daemon starts/);
		expect(connectToDaemon).not.toHaveBeenCalled();
		expect(process.exitCode).toBe(1);
	});
});
