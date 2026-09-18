import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import { postSlackMessage } from "./postSlackMessage";
import { reviewProposedSlackMessage } from "./reviewProposedSlackMessage";

vi.mock("../../shared/loadConfig", () => ({ loadConfig: () => ({}) }));
vi.mock("./reviewProposedSlackMessage", () => ({
	reviewProposedSlackMessage: vi.fn(),
}));

const review = vi.mocked(reviewProposedSlackMessage);

vi.spyOn(process, "exit").mockImplementation(() => {
	throw new Error("process.exit");
});
const mockError = vi.spyOn(console, "error").mockImplementation(() => {});
const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});

let dir: string;
const storeDir = process.env.ASSIST_STORE_DIR;

beforeAll(() => {
	dir = mkdtempSync(join(tmpdir(), "slack-post-"));
	process.env.ASSIST_STORE_DIR = dir;
});

afterAll(() => {
	process.env.ASSIST_STORE_DIR = storeDir;
	rmSync(dir, { recursive: true, force: true });
});

beforeEach(() => {
	vi.clearAllMocks();
	review.mockResolvedValue(undefined);
});

function part(name: string, contents: string): string {
	const path = join(dir, name);
	writeFileSync(path, contents);
	return path;
}

const slackDir = () => join(dir, "slack");

describe("postSlackMessage with --parts", () => {
	it("previews each part in thread order, then prints every working file", async () => {
		await postSlackMessage("#eng", {
			parts: [part("a.md", "one"), part("b.md", "two"), part("c.md", "three")],
		});

		expect(
			review.mock.calls.map(([target, body]) => [target.part, body]),
		).toEqual([
			[{ index: 1, total: 3 }, "one"],
			[{ index: 2, total: 3 }, "two"],
			[{ index: 3, total: 3 }, "three"],
		]);
		expect(mockLog.mock.calls.map(([line]) => line)).toEqual([
			"Approved for #eng. The 3 bodies to post, in thread order, are at:",
			`1/3 ${join(slackDir(), "eng-1.md")}`,
			`2/3 ${join(slackDir(), "eng-2.md")}`,
			`3/3 ${join(slackDir(), "eng-3.md")}`,
			"Post 1/3 to #eng, then the rest with the thread_ts it returns.",
		]);
		expect(readFileSync(join(slackDir(), "eng-2.md"), "utf8")).toBe("two\n");
	});

	it("applies the resolved thread_ts to every part and names it in the approved output", async () => {
		await postSlackMessage("#eng", {
			parts: [part("a.md", "one"), part("b.md", "two")],
			thread: "1712345678.123456",
		});

		expect(review.mock.calls.map(([target]) => target.threadTs)).toEqual([
			"1712345678.123456",
			"1712345678.123456",
		]);
		expect(mockLog.mock.calls.map(([line]) => line)).toEqual([
			"Approved for #eng (thread_ts 1712345678.123456). The 2 bodies to post, in thread order, are at:",
			`1/2 ${join(slackDir(), "eng-1.md")}`,
			`2/2 ${join(slackDir(), "eng-2.md")}`,
			"Post every part as a reply with thread_ts 1712345678.123456.",
		]);
	});

	it("prints no approved path when a part is rejected", async () => {
		review
			.mockImplementationOnce(async () => {})
			.mockImplementationOnce(() => {
				throw new Error("process.exit");
			});

		await expect(
			postSlackMessage("#eng", {
				parts: [
					part("a.md", "one"),
					part("b.md", "two"),
					part("c.md", "three"),
				],
			}),
		).rejects.toThrow("process.exit");

		expect(review).toHaveBeenCalledTimes(2);
		expect(mockLog).not.toHaveBeenCalled();
	});

	it("rejects --parts combined with --body before any pane opens", async () => {
		await expect(
			postSlackMessage("#eng", { body: "hi", parts: [part("a.md", "one")] }),
		).rejects.toThrow("process.exit");

		expect(review).not.toHaveBeenCalled();
		expect(mockError).toHaveBeenCalledWith(
			"Error: --parts cannot be combined with --body.",
		);
	});

	it("rejects a missing part file before any pane opens", async () => {
		await expect(
			postSlackMessage("#eng", {
				parts: [part("a.md", "one"), join(dir, "missing.md")],
			}),
		).rejects.toThrow("process.exit");

		expect(review).not.toHaveBeenCalled();
	});
});

describe("postSlackMessage with --body", () => {
	it("previews the single body and prints its working file", async () => {
		await postSlackMessage("#eng", { body: "hello" });

		expect(review).toHaveBeenCalledTimes(1);
		expect(review.mock.calls[0][0]).toEqual({
			channel: "#eng",
			threadTs: undefined,
		});
		expect(mockLog.mock.calls.map(([line]) => line)).toEqual([
			"Approved for #eng. The body to post is at:",
			join(slackDir(), "eng.md"),
		]);
	});
});
