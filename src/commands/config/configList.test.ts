import { beforeEach, describe, expect, it, vi } from "vitest";
import { SECRET_MASK } from "../../shared/maskConfigSecrets";
import { configList } from "../configList";

const mockConfig = vi.fn<() => Record<string, unknown>>();

vi.mock("../../shared/loadConfig", () => ({
	loadConfig: () => mockConfig(),
}));

function output(run: () => void): string {
	const lines: string[] = [];
	const log = vi.spyOn(console, "log").mockImplementation((line) => {
		lines.push(String(line));
	});
	try {
		run();
	} finally {
		log.mockRestore();
	}
	return lines.join("\n");
}

describe("configList", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("masks secrets and keeps the rest of the config readable", () => {
		mockConfig.mockReturnValue({
			commit: { push: true },
			database: { url: "postgres://user:pass@host/db" },
			seq: {
				connections: [{ name: "prod", url: "https://seq", apiToken: "t0k" }],
			},
		});

		const text = output(configList);

		expect(text).not.toContain("pass@host");
		expect(text).not.toContain("t0k");
		expect(text).toContain(`url: ${SECRET_MASK}`);
		expect(text).toContain(`apiToken: ${SECRET_MASK}`);
		expect(text).toContain("url: https://seq");
		expect(text).toContain("push: true");
	});

	it("omits an unset secret entirely", () => {
		mockConfig.mockReturnValue({ commit: { push: true } });

		expect(output(configList)).not.toContain(SECRET_MASK);
	});

	it("says it shows only what is set and points at config keys", () => {
		mockConfig.mockReturnValue({ commit: { push: true } });

		const text = output(configList);

		expect(text).toContain("# Only the keys that are set");
		expect(text).toContain("assist config keys");
	});
});
