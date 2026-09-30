import type { ConfigHelpEntry } from "../../shared/configHelp";

export const nextConfigHelp: ConfigHelpEntry[] = [
	{
		key: "next.peers",
		setter: "assist config set next.peers alice,bob -g --repo",
		note: "GitHub logins whose open, non-draft PRs the web /next view lists for review alongside PRs requesting your review; PRs you approved with no newer commits are hidden",
	},
	{
		key: "next.repos",
		setter: "assist config set next.repos my-org,other/web -g --repo",
		note: "GitHub repos the web /next view reads peer PRs and issues assigned to you from: owner/name for one repo, or a bare owner (org or user) for all its unarchived repos (default: the selected repo)",
	},
];
