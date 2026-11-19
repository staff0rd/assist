import { findHarnessAttribution } from "../../shared/findHarnessAttribution";
import { reviewerNameWords } from "../review/reviewerHarnesses";

const NAME_WORDS = reviewerNameWords.claude;
const NAME_PATTERNS = NAME_WORDS.map(
	(word) => new RegExp(`\\b${word}\\b`, "i"),
);

export function findHarnessNameViolation(
	label: string,
	text: string,
): string | undefined {
	if (NAME_PATTERNS.some((pattern) => pattern.test(text)))
		return `${label} must not contain ${NAME_WORDS.map((word) => `"${word}"`).join(" or ")}`;
	const phrase = findHarnessAttribution(text);
	if (phrase)
		return `${label} must not contain coding-agent attribution ("${phrase}")`;
	return undefined;
}
