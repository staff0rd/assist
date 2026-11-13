import * as os from "node:os";
import * as path from "node:path";
import { checkCliAvailable } from "./checkCliAvailable";

export type HarnessKind = "claude" | "claude-sdk" | "codex" | "pi";

export type Harness = {
	kind: HarnessKind;
	command: string;
	homeDir: string;
	sync: {
		commandDest: (name: string) => string;
		designPromptDest: string;
		designSkillDest: (name: string) => string;
		nativeDesignSkills: boolean;
	};
};

const claudeHarness: Harness = {
	kind: "claude",
	command: "claude",
	homeDir: path.join(os.homedir(), ".claude"),
	sync: {
		commandDest: (name) => path.join("skills", name, "SKILL.md"),
		designPromptDest: "design-system-prompt.md",
		designSkillDest: (name) => path.join("skills", `${name}.md`),
		nativeDesignSkills: false,
	},
};

export const harnesses: Record<HarnessKind, Harness> = {
	claude: claudeHarness,
	"claude-sdk": { ...claudeHarness, kind: "claude-sdk" },
	codex: {
		kind: "codex",
		command: "codex",
		homeDir: path.join(os.homedir(), ".codex"),
		sync: {
			commandDest: (name) => path.join("skills", name, "SKILL.md"),
			designPromptDest: path.join("assist", "design-system-prompt.md"),
			designSkillDest: (name) => path.join("skills", name, "SKILL.md"),
			nativeDesignSkills: true,
		},
	},
	pi: {
		kind: "pi",
		command: "pi",
		homeDir: path.join(os.homedir(), ".pi", "agent"),
		sync: {
			commandDest: (name) => path.join("prompts", `${name}.md`),
			designPromptDest: path.join("assist", "design-system-prompt.md"),
			designSkillDest: (name) =>
				path.join("assist", "design-skills", `${name}.md`),
			nativeDesignSkills: false,
		},
	},
};

export function isHarnessAvailable(kind: HarnessKind): boolean {
	return checkCliAvailable(harnesses[kind].command);
}
