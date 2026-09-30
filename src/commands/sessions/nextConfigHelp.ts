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
	{
		key: "next.project",
		setter: "assist config set next.project my-org/3 -g --repo",
		note: "GitHub Project (owner/number, from its URL) the web /next view suggests unassigned issues to pick up from; needs the gh project scope",
	},
	{
		key: "next.pickStatuses",
		setter: "assist config set next.pickStatuses Ready,Todo -g --repo",
		note: "Project Status values whose unassigned items the web /next view offers to pick up (default: Ready, Todo)",
	},
];
