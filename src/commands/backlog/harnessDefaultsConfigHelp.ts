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
).flatMap(([type, launch]) => [
	{
		key: `harness.defaults.${type}.harness`,
		setter: `assist config set harness.defaults.${type}.harness <claude|codex|pi>`,
		note: `harness for ${launch} when none is picked; unset falls back to harness.engine`,
	},
	{
		key: `harness.defaults.${type}.model`,
		setter: `assist config set harness.defaults.${type}.model <model>`,
		note: `model for ${launch} on the type's harness; unset uses the harness's own default`,
	},
]);
