import type { NextIssue } from "../../../../../next/types";
import { useRequestNewSession } from "../../../../useRequestNewSession";

export type StartableIssue = Pick<
	NextIssue,
	"repo" | "number" | "title" | "url"
>;

export function useStartIssue(): (issue: StartableIssue, cwd: string) => void {
	const request = useRequestNewSession();
	return (issue, cwd) =>
		request({
			prompt: `Issue ${issue.repo}#${issue.number}: ${issue.title}\n${issue.url}`,
			cwd,
		});
}
