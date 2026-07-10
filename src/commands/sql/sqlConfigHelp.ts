import type { ConfigHelpEntry } from "../../shared/configHelp";

export const sqlConfigHelp: ConfigHelpEntry[] = [
	{
		key: "sql.connections",
		setter: "assist sql auth add",
		note: "named MSSQL connections (add/list/remove via sql auth)",
	},
	{
		key: "sql.defaultConnection",
		setter: "assist sql set-connection <name>",
		note: "connection used when none is passed",
	},
];
