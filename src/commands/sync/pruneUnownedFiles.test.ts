import {
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import type * as osModule from "node:os";
import type * as urlModule from "node:url";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";
import { sync } from "../sync";

const env = vi.hoisted(() => ({
	home: `${process.env.TMPDIR ?? "/tmp"}/assist-prune-home-${process.pid}`,
	distEntry: new URL("../../../dist/index.js", import.meta.url).pathname,
}));

vi.mock("node:os", async () => {
	const actual = await vi.importActual<typeof osModule>("node:os");
	return { ...actual, homedir: () => env.home };
});

vi.mock("node:url", async () => {
	const actual = await vi.importActual<typeof urlModule>("node:url");
	return {
		...actual,
		fileURLToPath: (url: string | URL) =>
			String(url).endsWith("/commands/sync.ts")
				? env.distEntry
				: actual.fileURLToPath(url),
	};
});

vi.mock("../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

vi.mock("../../shared/checkCliAvailable", () => ({
	checkCliAvailable: (cli: string) => cli === "pi",
}));

function seed(relative: string, content = "user content"): string {
	const full = join(env.home, relative);
	mkdirSync(dirname(full), { recursive: true });
	writeFileSync(full, content);
	return full;
}

describe("sync --prune --force", () => {
	beforeEach(() => {
		rmSync(env.home, { recursive: true, force: true });
		mkdirSync(env.home, { recursive: true });
		process.env.ASSIST_STORE_DIR = join(env.home, ".assist");
		vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		delete process.env.ASSIST_STORE_DIR;
		rmSync(env.home, { recursive: true, force: true });
	});

	it("leaves user-authored commands, skills and Pi prompts in place", async () => {
		const userFiles = [
			seed(".claude/commands/notes.md"),
			seed(".claude/skills/mine/SKILL.md"),
			seed(".pi/agent/prompts/mine.md"),
		];

		await sync({ yes: true, prune: true, force: true });

		for (const file of userFiles) {
			expect(readFileSync(file, "utf8"), file).toBe("user content");
		}
	});

	it("removes only the orphans a previous sync wrote", async () => {
		const retired = [
			seed(".claude/skills/retired/SKILL.md"),
			seed(".pi/agent/prompts/retired.md"),
		];
		mkdirSync(join(env.home, ".assist"), { recursive: true });
		writeFileSync(
			join(env.home, ".assist", "sync-manifest.json"),
			JSON.stringify({ files: retired }),
		);
		const notes = seed(".claude/commands/notes.md");

		await sync({ yes: true, prune: true, force: true });

		for (const file of retired) expect(existsSync(file), file).toBe(false);
		expect(existsSync(notes)).toBe(true);
	});
});
