import { useSearchParams } from "react-router";
import type { NextIssue } from "../../../../../next/types";

export function useStartIssue(): (issue: NextIssue) => void {
	const [, setSearchParams] = useSearchParams();
	return (issue) =>
		setSearchParams(
			(params) => {
				params.set(
					"new",
					`Issue #${issue.number}: ${issue.title}\n${issue.url}`,
				);
				return params;
			},
			{ replace: true },
		);
}
