import { afterEach, describe, expect, it, vi } from "vitest";
import { revalidateBacklog } from "./revalidateBacklog";
import { startBacklogPolling } from "./startBacklogPolling";

vi.mock("./revalidateBacklog", () => ({ revalidateBacklog: vi.fn() }));

afterEach(() => {
	vi.useRealTimers();
	vi.mocked(revalidateBacklog).mockReset();
});

describe("startBacklogPolling", () => {
	it("skips ticks while a request is still in flight", async () => {
		vi.useFakeTimers();
		let finish = () => {};
		vi.mocked(revalidateBacklog).mockImplementation(
			() =>
				new Promise<void>((resolve) => {
					finish = resolve;
				}),
		);
		const stop = startBacklogPolling("/repo", "todo", {
			onLoaded: () => {},
			onError: () => {},
		});
		await vi.advanceTimersByTimeAsync(20_000);
		expect(revalidateBacklog).toHaveBeenCalledTimes(1);
		finish();
		await vi.advanceTimersByTimeAsync(5000);
		expect(revalidateBacklog).toHaveBeenCalledTimes(2);
		stop();
	});
});
