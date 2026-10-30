import type { ConfigHelpEntry } from "../../shared/configHelp";

export const inboxConfigHelp: ConfigHelpEntry[] = [
	{
		key: "inbox.intervalMinutes",
		setter: "assist config set inbox.intervalMinutes <n> --node",
		note: "minutes between scheduled inbox scans run by this machine's daemon (picked up within a minute); read from ~/.assist.yml only, so a repo's assist.yml or shared overrides can't enable it. Unset by default: no scheduled scans",
	},
];
