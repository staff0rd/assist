import type { Migration } from "./Migration";

const sql = `
	ALTER TABLE items ADD COLUMN IF NOT EXISTS github_issue TEXT;
`;

export const migration0007GithubIssue: Migration = {
	id: 7,
	name: "github-issue",
	sql,
};
