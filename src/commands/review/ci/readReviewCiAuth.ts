import { type ReviewCiKey, reviewCiSecret } from "./reviewCiVariables";
import { reviewCiAuthKeys } from "./reviewCiAuthKeys";

export type ReviewCiAuthConfig =
	| { kind: "key"; apiKey: string }
	| { kind: "entra"; clientId: string; tenantId: string };

export function readReviewCiAuth(
	provider: string,
	value: (key: ReviewCiKey) => string,
): ReviewCiAuthConfig {
	if (reviewCiAuthKeys(provider, value).includes(reviewCiSecret))
		return { kind: "key", apiKey: value(reviewCiSecret) };
	return {
		kind: "entra",
		clientId: value("REVIEW_CI_AZURE_CLIENT_ID"),
		tenantId: value("REVIEW_CI_AZURE_TENANT_ID"),
	};
}
