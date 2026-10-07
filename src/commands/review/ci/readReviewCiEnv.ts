import type { ReviewerModels } from "../ReviewerModels";
import { parseSlot, type ReviewCiSlot } from "./parseSlot";
import {
	type ReviewCiKey,
	type ReviewCiVariable,
	reviewCiVariables,
} from "./reviewCiVariables";
import { reviewCiAuthKeys } from "./reviewCiAuthKeys";
import { type ReviewCiAuthConfig, readReviewCiAuth } from "./readReviewCiAuth";

type ReviewCiSlotName = keyof ReviewerModels;

export type ReviewCiConfig = {
	provider: string;
	baseUrl: string;
	slots: Record<ReviewCiSlotName, ReviewCiSlot>;
	auth: ReviewCiAuthConfig;
};

const slotVariables: Record<ReviewCiSlotName, ReviewCiVariable> = {
	claude: "ASSIST_REVIEW_REVIEWER_1",
	codex: "ASSIST_REVIEW_REVIEWER_2",
	synthesis: "ASSIST_REVIEW_SYNTHESIS",
};

export function readReviewCiEnv(env: NodeJS.ProcessEnv): {
	config: ReviewCiConfig | null;
	errors: string[];
} {
	const value = (key: ReviewCiKey) => env[key]?.trim() ?? "";
	const provider = value("ASSIST_REVIEW_PROVIDER");
	const missing = [
		...reviewCiVariables,
		...reviewCiAuthKeys(provider, value),
	].filter((key) => !value(key));
	if (missing.length > 0)
		return { config: null, errors: missing.map((key) => `${key} is not set`) };

	const parsed = Object.entries(slotVariables).map(
		([name, key]) => [name, parseSlot(key, value(key))] as const,
	);
	const errors = parsed.flatMap(([, slot]) =>
		typeof slot === "string" ? [slot] : [],
	);
	if (errors.length > 0) return { config: null, errors };

	return {
		config: {
			provider,
			baseUrl: value("ASSIST_REVIEW_BASE_URL").replace(/\/+$/, ""),
			slots: Object.fromEntries(parsed) as ReviewCiConfig["slots"],
			auth: readReviewCiAuth(provider, value),
		},
		errors,
	};
}
