import type { ConfigHelpEntry } from "../../shared/configHelp";

export const seqConfigHelp: ConfigHelpEntry[] = [
	{
		key: "seq.connections",
		setter: "assist seq auth add",
		note: "named Seq connections (add/list/remove via seq auth)",
	},
	{
		key: "seq.defaultConnection",
		setter: "assist seq set-connection <name>",
		note: "connection used when none is passed",
	},
];
