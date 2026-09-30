import { useSearchParams } from "react-router";
import type { NextIssue } from "../../../../../next/types";

export function useStartIssue(): (issue: NextIssue, cwd: string) => void {
	const [, setSearchParams] = useSearchParams();
	return (issue, cwd) =>
		setSearchParams(
			(params) => {
				params.set(
					"new",
					`Issue ${issue.repo}#${issue.number}: ${issue.title}\n${issue.url}`,
				);
				params.set("newCwd", cwd);
				return params;
			},
			{ replace: true },
		);
}
