import { afterEach, describe, expect, it, vi } from "vitest";
import { connectToDaemon } from "../../commands/sessions/daemon/connectToDaemon";
import { launchSdkViaDaemon } from "./launchSdkViaDaemon";

vi.mock("../../commands/sessions/daemon/connectToDaemon", () => ({
	connectToDaemon: vi.fn(),
}));

describe("launchSdkViaDaemon", () => {
	afterEach(() => vi.unstubAllEnvs());

	it("refuses outside a Claude (SDK) daemon session without connecting", async () => {
		vi.stubEnv("ASSIST_SDK_SESSION", "");
		const { done } = launchSdkViaDaemon({ prompt: "/refine a1", cwd: "/r" });
		await expect(done).rejects.toThrow(/sessions the assist daemon starts/);
		expect(connectToDaemon).not.toHaveBeenCalled();
	});
});
