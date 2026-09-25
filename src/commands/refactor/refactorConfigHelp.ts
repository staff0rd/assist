import type { ConfigHelpEntry } from "../../shared/configHelp";

export const refactorConfigHelp: ConfigHelpEntry[] = [
	{
		key: "restructure.ignore",
		setter: 'assist config set restructure.ignore "src/generated/**"',
		note: "globs (relative to cwd) of files restructure never moves; they are treated as outside the root",
	},
	{
		key: "restructure.pin",
		setter: 'assist config set restructure.pin "SessionCard"',
		note: "module names (basename without extension) restructure lifts out of deep import chains into the folder of the nearest root or pinned module above them, together with their subtrees",
	},
];
