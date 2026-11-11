import {
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	rmSync,
} from "node:fs";
import type * as osModule from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSyncFiles } from "./createSyncFiles";
import { syncCodex } from "./syncCodex";
import { syncPi } from "./syncPi";

const env = vi.hoisted(() => ({
	home: `${process.env.TMPDIR ?? "/tmp"}/assist-clean-home-${process.pid}`,
}));

vi.mock("node:os", async () => {
	const actual = await vi.importActual<typeof osModule>("node:os");
	return { ...actual, homedir: () => env.home };
});

const repoClaudeDir = resolve(__dirname, "..", "..", "..", "claude");
const designSkills = readdirSync(join(repoClaudeDir, "skills")).map((file) =>
	file.replace(/\.md$/, ""),
);

vi.mock("./trustAssistCodexHooks", () => ({
	trustAssistCodexHooks: async () => 6,
}));

vi.mock("../../shared/checkCliAvailable", () => ({
	checkCliAvailable: (cli: string) => cli === "codex",
}));

describe("clean-home sync with only Codex installed", () => {
	const home = env.home;

	beforeEach(() => {
		rmSync(home, { recursive: true, force: true });
		mkdirSync(home, { recursive: true });
		vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		rmSync(home, { recursive: true, force: true });
	});

	async function syncHarnesses() {
		const files = createSyncFiles([]);
		await syncCodex(repoClaudeDir, files);
		syncPi(repoClaudeDir, files);
	}

	it("installs design mode's prompt and native design skills for Codex", async () => {
		await syncHarnesses();

		expect(
			readFileSync(
				join(home, ".codex", "assist", "design-system-prompt.md"),
				"utf8",
			),
		).toBe(
			readFileSync(join(repoClaudeDir, "design-system-prompt.md"), "utf8"),
		);
		for (const name of designSkills) {
			const skill = readFileSync(
				join(home, ".codex", "skills", name, "SKILL.md"),
				"utf8",
			);
			expect(skill).toMatch(
				new RegExp(`^---\\nname: ${name}\\ndescription: "`),
			);
		}
	});

	it("points every synced Codex skill at Codex resources, never ~/.claude", async () => {
		await syncHarnesses();

		const skillsDir = join(home, ".codex", "skills");
		for (const name of readdirSync(skillsDir)) {
			const skill = readFileSync(join(skillsDir, name, "SKILL.md"), "utf8");
			expect(skill, name).not.toContain("~/.claude");
			expect(skill, name).not.toMatch(/\{\{[a-z.:-]+\}\}/);
		}
		const design = readFileSync(join(skillsDir, "design", "SKILL.md"), "utf8");
		expect(design).toContain("`~/.codex/assist/design-system-prompt.md`");
		expect(design).toContain("`~/.codex/skills/<name>/SKILL.md`");
		expect(
			readFileSync(join(skillsDir, "draft", "SKILL.md"), "utf8"),
		).toContain("`~/.codex/skills/design/SKILL.md`");
	});

	it("registers the Codex hooks and writes nothing for absent harnesses", async () => {
		await syncHarnesses();

		expect(readFileSync(join(home, ".codex", "config.toml"), "utf8")).toContain(
			"assist codex-hook",
		);
		expect(existsSync(join(home, ".pi"))).toBe(false);
		expect(existsSync(join(home, ".claude"))).toBe(false);
	});
});
