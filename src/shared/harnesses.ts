import * as os from "node:os";
import * as path from "node:path";
import { checkCliAvailable } from "./checkCliAvailable";

export type HarnessKind =
	| "claude"
	| "claude-sdk"
	| "codex"
	| "codex-sdk"
	| "pi";

export type SlashCommandSources = {
	userHomes: string[];
	projectDirs: string[];
};

export type Harness = {
	kind: HarnessKind;
	command: string;
	homeDir: string;
	slashCommandSources: SlashCommandSources;
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
	slashCommandSources: {
		userHomes: [path.join(os.homedir(), ".claude")],
		projectDirs: [".claude"],
	},
	sync: {
		commandDest: (name) => path.join("skills", name, "SKILL.md"),
		designPromptDest: "design-system-prompt.md",
		designSkillDest: (name) => path.join("skills", `${name}.md`),
		nativeDesignSkills: false,
	},
};

const codexHarness: Harness = {
	kind: "codex",
	command: "codex",
	homeDir: path.join(os.homedir(), ".codex"),
	// why: Codex reads user skills from $CODEX_HOME/skills (where assist sync installs them) and ~/.agents/skills, and project skills from .agents/skills (legacy .codex/skills)
	slashCommandSources: {
		userHomes: [
			path.join(os.homedir(), ".codex"),
			path.join(os.homedir(), ".agents"),
		],
		projectDirs: [".agents", ".codex"],
	},
	sync: {
		commandDest: (name) => path.join("skills", name, "SKILL.md"),
		designPromptDest: path.join("assist", "design-system-prompt.md"),
		designSkillDest: (name) => path.join("skills", name, "SKILL.md"),
		nativeDesignSkills: true,
	},
};

export const harnesses: Record<HarnessKind, Harness> = {
	claude: claudeHarness,
	"claude-sdk": { ...claudeHarness, kind: "claude-sdk" },
	codex: codexHarness,
	"codex-sdk": { ...codexHarness, kind: "codex-sdk" },
	pi: {
		kind: "pi",
		command: "pi",
		homeDir: path.join(os.homedir(), ".pi", "agent"),
		slashCommandSources: {
			userHomes: [path.join(os.homedir(), ".pi", "agent")],
			projectDirs: [".pi"],
		},
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
