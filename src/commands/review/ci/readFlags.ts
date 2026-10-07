import { parseArgs } from "node:util";
import type { ReviewCiKey } from "./reviewCiVariables";

const flagKeys: Record<string, ReviewCiKey> = {
	provider: "REVIEW_CI_PROVIDER",
	"base-url": "REVIEW_CI_BASE_URL",
	"reviewer-1": "REVIEW_CI_REVIEWER_1",
	"reviewer-2": "REVIEW_CI_REVIEWER_2",
	synthesis: "REVIEW_CI_SYNTHESIS",
	"azure-client-id": "REVIEW_CI_AZURE_CLIENT_ID",
	"azure-tenant-id": "REVIEW_CI_AZURE_TENANT_ID",
	environment: "REVIEW_CI_ENVIRONMENT",
};

export function readFlags(argv: string[]): {
	values: Partial<Record<ReviewCiKey, string>>;
	skipCheck: boolean;
} {
	const { values } = parseArgs({
		args: argv,
		options: {
			...Object.fromEntries(
				Object.keys(flagKeys).map((flag) => [flag, { type: "string" }]),
			),
			"skip-check": { type: "boolean" },
		},
	});
	const { "skip-check": skipCheck, ...strings } = values;
	return {
		values: Object.fromEntries(
			Object.entries(strings).map(([flag, value]) => [flagKeys[flag], value]),
		),
		skipCheck: skipCheck === true,
	};
}
