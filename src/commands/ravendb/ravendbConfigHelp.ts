import type { ConfigHelpEntry } from "../../shared/configHelp";

export const ravendbConfigHelp: ConfigHelpEntry[] = [
	{
		key: "ravendb.connections",
		setter: "assist ravendb auth add",
		note: "named RavenDB connections (add/list/remove via ravendb auth)",
	},
	{
		key: "ravendb.defaultConnection",
		setter: "assist ravendb set-connection <name>",
		note: "connection used when none is passed",
	},
];
