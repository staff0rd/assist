import enquirer from "enquirer";
import { exitOnCancel } from "../../../shared/exitOnCancel";
import { type ReviewCiKey, reviewCiProviders } from "./reviewCiVariables";

type PromptOptions = Exclude<
	Parameters<typeof enquirer.prompt>[0],
	unknown[] | ((...args: never[]) => unknown)
>;

const slotHint = "(claude:<model> or codex:<model>)";

const prompts: Record<ReviewCiKey, PromptOptions> = {
	REVIEW_CI_PROVIDER: {
		name: "value",
		type: "select",
		message: "Provider",
		choices: [...reviewCiProviders],
	},
	REVIEW_CI_BASE_URL: {
		name: "value",
		type: "input",
		message:
			"Base URL (litellm: the proxy root; foundry: https://<resource>.services.ai.azure.com)",
	},
	REVIEW_CI_REVIEWER_1: {
		name: "value",
		type: "input",
		message: `Reviewer 1 ${slotHint}`,
	},
	REVIEW_CI_REVIEWER_2: {
		name: "value",
		type: "input",
		message: `Reviewer 2 ${slotHint}`,
	},
	REVIEW_CI_SYNTHESIS: {
		name: "value",
		type: "input",
		message: `Synthesis ${slotHint}`,
	},
	REVIEW_CI_AZURE_CLIENT_ID: {
		name: "value",
		type: "input",
		message: "Azure client ID for Entra auth (blank to use an API key)",
	},
	REVIEW_CI_AZURE_TENANT_ID: {
		name: "value",
		type: "input",
		message: "Azure tenant ID",
	},
	REVIEW_CI_ENVIRONMENT: {
		name: "value",
		type: "input",
		message:
			"GitHub environment the federated credential is scoped to (blank for none)",
	},
	REVIEW_CI_API_KEY: {
		name: "value",
		type: "password",
		message: "API key",
	},
};

export async function askReviewCiKey(
	key: ReviewCiKey,
	given: Partial<Record<ReviewCiKey, string>>,
	optional = false,
): Promise<string> {
	const value = given[key]?.trim();
	if (value) return value;
	if (!process.stdin.isTTY) {
		if (optional) return "";
		throw new Error(
			`${key} was not given and stdin is not a terminal to prompt for it`,
		);
	}
	const answer = await exitOnCancel(
		enquirer.prompt<{ value: string }>(prompts[key]),
	);
	return answer.value.trim();
}
