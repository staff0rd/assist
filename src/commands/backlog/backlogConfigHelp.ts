import type { ConfigHelpEntry } from "../../shared/configHelp";

export const backlogConfigHelp: ConfigHelpEntry[] = [
	{
		key: "database.url",
		setter: "assist config set database.url postgresql://...",
		note: "Postgres connection string for backlog storage (or ASSIST_DATABASE_URL)",
	},
	{
		key: "subtasks",
		setter: 'assist config set subtasks.0.title "Review"',
		note: "default sub-tasks seeded onto every new backlog item",
	},
];
