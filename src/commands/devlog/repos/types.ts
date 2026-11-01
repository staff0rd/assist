export type RepoRow = {
	name: string;
	lastPush: string;
	lastWeek: string | null;
	status: "missing" | "outdated" | "ok";
};
