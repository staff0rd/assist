import type { AzureDevopsRepo } from "../../../../shared/azureDevops/parseAzureDevopsRemote";
import { azureDevopsRepoUrl } from "../../../prs/azureDevops/azureDevopsRepoUrl";
import type { GithubPlanError } from "./resolveGithubClone";

export function azureDevopsNotCloned(
	repo: AzureDevopsRepo,
	baseDir: string,
): GithubPlanError {
	return {
		ok: false,
		status: 404,
		error: `${repo.org}/${repo.project}/${repo.repo} is not cloned under ${baseDir}; clone ${azureDevopsRepoUrl(repo)} there and retry`,
	};
}
