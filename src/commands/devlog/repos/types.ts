export type RepoRow = {
	name: string;
	lastPush: string;
	lastDevlog: string | null;
	status: "missing" | "outdated" | "ok";
};
