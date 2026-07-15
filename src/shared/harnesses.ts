import * as os from "node:os";
import * as path from "node:path";
import { checkCliAvailable } from "./checkCliAvailable";

export type HarnessKind = "claude" | "codex" | "pi";

export type Harness = {
	kind: HarnessKind;
	command: string;
	homeDir: string;
	sync: {
		agentsFile: string;
		commandDest: (name: string) => string;
	};
};

export const harnesses: Record<HarnessKind, Harness> = {
	claude: {
		kind: "claude",
		command: "claude",
		homeDir: path.join(os.homedir(), ".claude"),
		sync: {
			agentsFile: "CLAUDE.md",
			commandDest: (name) => path.join("commands", `${name}.md`),
		},
	},
	codex: {
		kind: "codex",
		command: "codex",
		homeDir: path.join(os.homedir(), ".codex"),
		sync: {
			agentsFile: "AGENTS.md",
			commandDest: (name) => path.join("skills", name, "SKILL.md"),
		},
	},
	pi: {
		kind: "pi",
		command: "pi",
		homeDir: path.join(os.homedir(), ".pi", "agent"),
		sync: {
			agentsFile: "AGENTS.md",
			commandDest: (name) => path.join("prompts", `${name}.md`),
		},
	},
};

export function isHarnessAvailable(kind: HarnessKind): boolean {
	return checkCliAvailable(harnesses[kind].command);
}
