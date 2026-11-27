import { resolveRepoRoot } from "../resolveRepoRoot";
import { requireInstanceAuth } from "./auth/requireInstanceAuth";
import { exitWithError } from "./exitWithError";
import { planReviewInstance } from "./planReviewInstance";
import { requireInstanceConfig } from "./requireInstanceConfig";
import { resolvePrHead } from "./resolvePrHead";
import { loadManualTesting } from "./steps/loadManualTesting";

export async function prepareReviewInstance(pr: string) {
	const head = resolvePrHead(pr);
	const config = requireInstanceConfig();
	const manualTesting = loadManualTesting(head);
	const repoRoot = resolveRepoRoot();
	const auth = requireInstanceAuth(config, repoRoot);
	const instance = await planReviewInstance({
		config,
		repoRoot,
		repo: head.repo,
		prNumber: head.number,
	}).catch((error: Error) => exitWithError(error.message));
	return { head, config, manualTesting, auth, instance };
}
