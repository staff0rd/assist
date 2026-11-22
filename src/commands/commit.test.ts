import { beforeEach, describe, expect, it, vi } from "vitest";
import { commit } from "./commit";
import { execCommit } from "./commit/execCommit";
import { mergeInProgress } from "./commit/mergeInProgress";
import { validateMessage } from "./commit/validateMessage";

vi.mock("../shared/loadConfig", () => ({ loadConfig: () => ({}) }));
vi.mock("./commit/execCommit", () => ({ execCommit: vi.fn() }));
vi.mock("./commit/mergeInProgress", () => ({ mergeInProgress: vi.fn() }));
vi.mock("./commit/validateMessage", () => ({ validateMessage: vi.fn() }));

describe("commit", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, "error").mockImplementation(() => {});
		vi.spyOn(process, "exit").mockImplementation((() => {
			throw new Error("exit");
		}) as never);
	});

	it("errors with the usage when no message is given outside a merge", async () => {
		vi.mocked(mergeInProgress).mockReturnValue(false);

		await expect(commit([])).rejects.toThrow("exit");

		expect(console.error).toHaveBeenCalledWith(
			"Usage: assist commit <message> [files...]",
		);
		expect(execCommit).not.toHaveBeenCalled();
	});

	it("concludes a merge with git's prepared message when none is given", async () => {
		vi.mocked(mergeInProgress).mockReturnValue(true);

		await commit([]);

		expect(validateMessage).not.toHaveBeenCalled();
		expect(execCommit).toHaveBeenCalledWith([], null, {}, { merging: true });
	});

	it("validates a message given during a merge", async () => {
		vi.mocked(mergeInProgress).mockReturnValue(true);

		await commit(["fix: merge main"]);

		expect(validateMessage).toHaveBeenCalledWith("fix: merge main", {});
		expect(execCommit).toHaveBeenCalledWith(
			[],
			"fix: merge main",
			{},
			{
				merging: true,
			},
		);
	});

	it("needs a message for --ref during a merge", async () => {
		vi.mocked(mergeInProgress).mockReturnValue(true);

		await expect(commit([], { ref: ["see https://x.y"] })).rejects.toThrow(
			"exit",
		);
		expect(execCommit).not.toHaveBeenCalled();
	});
});
