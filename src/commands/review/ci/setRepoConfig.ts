import { execFileSync, spawnSync } from "node:child_process";
import {
	type ReviewCiKey,
	reviewCiEntraVariables,
	reviewCiSecret,
	reviewCiVariables,
} from "./reviewCiVariables";

const retiredVariables = [
	"ASSIST_REVIEW_PROVIDER",
	"ASSIST_REVIEW_BASE_URL",
	"ASSIST_REVIEW_CLAUDE_MODEL",
	"ASSIST_REVIEW_CODEX_MODEL",
	"ASSIST_REVIEW_REVIEWER_1",
	"ASSIST_REVIEW_REVIEWER_2",
	"ASSIST_REVIEW_SYNTHESIS",
	"ASSIST_REVIEW_AZURE_CLIENT_ID",
	"ASSIST_REVIEW_AZURE_TENANT_ID",
	"ASSIST_REVIEW_ENVIRONMENT",
];

const retiredSecret = "ASSIST_REVIEW_API_KEY";

function deleteIfSet(kind: "variable" | "secret", key: string): void {
	spawnSync("gh", [kind, "delete", key], { stdio: "ignore" });
}

export function setRepoConfig(
	values: Partial<Record<ReviewCiKey, string>>,
): void {
	for (const key of [...reviewCiVariables, ...reviewCiEntraVariables]) {
		const value = values[key];
		if (!value) {
			deleteIfSet("variable", key);
			continue;
		}
		execFileSync("gh", ["variable", "set", key, "--body", value], {
			stdio: ["ignore", "inherit", "inherit"],
		});
	}
	for (const key of retiredVariables) deleteIfSet("variable", key);
	deleteIfSet("secret", retiredSecret);
	const apiKey = values[reviewCiSecret];
	if (!apiKey) return;
	execFileSync("gh", ["secret", "set", reviewCiSecret], {
		input: apiKey,
		stdio: ["pipe", "inherit", "inherit"],
	});
}
