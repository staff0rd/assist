import type { ConfigHelpEntry } from "../../shared/configHelp";

const launches = {
	draft: "draft sessions (assist draft, New Session dialog)",
	bug: "bug sessions (assist bug, New Session dialog)",
	prompt: "prompt sessions in the New Session dialog",
	design: "design sessions in the New Session dialog",
	run: "backlog runs (assist backlog run, web Start buttons)",
};

export const harnessDefaultsConfigHelp: ConfigHelpEntry[] = Object.entries(
	launches,
).map(([type, launch]) => ({
	key: `harness.defaults.${type}.harness`,
	setter: `assist config set harness.defaults.${type}.harness <claude|codex|pi>`,
	note: `harness for ${launch} when none is picked; unset falls back to harness.engine`,
}));
