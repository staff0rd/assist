import { useSearchParams } from "react-router";
import type { PhoneBacklogRepo } from "./usePhoneBacklogRepos";

export function usePickedRepo(repos: PhoneBacklogRepo[] | undefined) {
	const [params, setParams] = useSearchParams();
	const picked = params.get("repo");
	const repo =
		repos?.find((r) => r.origin === picked) ??
		repos?.find((r) => r.isCurrent) ??
		repos?.[0];
	const pick = (origin: string) =>
		setParams({ repo: origin }, { replace: true });
	return { repo, pick };
}
