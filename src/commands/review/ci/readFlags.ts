import { parseArgs } from "node:util";
import type { ReviewCiKey } from "./reviewCiVariables";

const flagKeys: Record<string, ReviewCiKey> = {
	provider: "ASSIST_REVIEW_PROVIDER",
	"base-url": "ASSIST_REVIEW_BASE_URL",
	"reviewer-1": "ASSIST_REVIEW_REVIEWER_1",
	"reviewer-2": "ASSIST_REVIEW_REVIEWER_2",
	synthesis: "ASSIST_REVIEW_SYNTHESIS",
	"azure-client-id": "ASSIST_REVIEW_AZURE_CLIENT_ID",
	"azure-tenant-id": "ASSIST_REVIEW_AZURE_TENANT_ID",
	environment: "ASSIST_REVIEW_ENVIRONMENT",
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
