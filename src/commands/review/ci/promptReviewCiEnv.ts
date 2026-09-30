import enquirer from "enquirer";
import { exitOnCancel } from "../../../shared/exitOnCancel";
import {
	type ReviewCiKey,
	reviewCiKeys,
	reviewCiProviders,
	reviewCiSecret,
} from "./reviewCiVariables";
import { readFlags } from "./readFlags";

type PromptOptions = Exclude<
	Parameters<typeof enquirer.prompt>[0],
	unknown[] | ((...args: never[]) => unknown)
>;

const prompts: Record<ReviewCiKey, PromptOptions> = {
	ASSIST_REVIEW_PROVIDER: {
		name: "value",
		type: "select",
		message: "Provider",
		choices: [...reviewCiProviders],
	},
	ASSIST_REVIEW_BASE_URL: { name: "value", type: "input", message: "Base URL" },
	ASSIST_REVIEW_CLAUDE_MODEL: {
		name: "value",
		type: "input",
		message: "Claude model",
	},
	ASSIST_REVIEW_CODEX_MODEL: {
		name: "value",
		type: "input",
		message: "Codex model",
	},
	ASSIST_REVIEW_API_KEY: {
		name: "value",
		type: "password",
		message: "API key",
	},
};

export async function promptReviewCiEnv(
	argv: string[],
	env: NodeJS.ProcessEnv,
): Promise<Record<ReviewCiKey, string>> {
	const given: Partial<Record<ReviewCiKey, string>> = {
		...readFlags(argv),
		[reviewCiSecret]: env[reviewCiSecret],
	};
	const result = {} as Record<ReviewCiKey, string>;
	for (const key of reviewCiKeys) {
		const value = given[key]?.trim();
		if (value) {
			result[key] = value;
			continue;
		}
		if (!process.stdin.isTTY)
			throw new Error(
				`${key} was not given and stdin is not a terminal to prompt for it`,
			);
		const answer = await exitOnCancel(
			enquirer.prompt<{ value: string }>(prompts[key]),
		);
		result[key] = answer.value.trim();
	}
	return result;
}
