import { execFileSync, spawnSync } from "node:child_process";
import {
	type ReviewCiKey,
	reviewCiEntraVariables,
	reviewCiSecret,
	reviewCiVariables,
} from "./reviewCiVariables";

const retiredVariables = [
	"ASSIST_REVIEW_CLAUDE_MODEL",
	"ASSIST_REVIEW_CODEX_MODEL",
];

function deleteVariableIfSet(key: string): void {
	spawnSync("gh", ["variable", "delete", key], { stdio: "ignore" });
}

export function setRepoConfig(
	values: Partial<Record<ReviewCiKey, string>>,
): void {
	for (const key of [...reviewCiVariables, ...reviewCiEntraVariables]) {
		const value = values[key];
		if (!value) {
			deleteVariableIfSet(key);
			continue;
		}
		execFileSync("gh", ["variable", "set", key, "--body", value], {
			stdio: ["ignore", "inherit", "inherit"],
		});
	}
	for (const key of retiredVariables) deleteVariableIfSet(key);
	const apiKey = values[reviewCiSecret];
	if (!apiKey) return;
	execFileSync("gh", ["secret", "set", reviewCiSecret], {
		input: apiKey,
		stdio: ["pipe", "inherit", "inherit"],
	});
}
