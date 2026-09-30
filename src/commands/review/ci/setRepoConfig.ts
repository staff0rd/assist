import { execFileSync } from "node:child_process";
import {
	type ReviewCiKey,
	reviewCiSecret,
	reviewCiVariables,
} from "./reviewCiVariables";

export function setRepoConfig(values: Record<ReviewCiKey, string>): void {
	for (const key of reviewCiVariables) {
		execFileSync("gh", ["variable", "set", key, "--body", values[key]], {
			stdio: ["ignore", "inherit", "inherit"],
		});
	}
	execFileSync("gh", ["secret", "set", reviewCiSecret], {
		input: values[reviewCiSecret],
		stdio: ["pipe", "inherit", "inherit"],
	});
}
