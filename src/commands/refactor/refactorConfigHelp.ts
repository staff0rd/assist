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
	{
		key: "restructure.maxDepth",
		setter: "assist config set restructure.maxDepth 10",
		note: "deepest folder level the plan may place a file at (default 10); deeper plans list their deep chains with pin guidance, and --check fails",
	},
	{
		key: "restructure.maxFolderPercent",
		setter: "assist config set restructure.maxFolderPercent 15",
		note: "most files any folder except the root may hold, as a percentage of all files under the root (default 15, never below 20, capped by restructure.maxFolderFiles); larger folders are listed with pin guidance, and --check fails",
	},
	{
		key: "restructure.maxFolderFiles",
		setter: "assist config set restructure.maxFolderFiles 150",
		note: "cap on the restructure.maxFolderPercent folder limit (default 150)",
	},
];
