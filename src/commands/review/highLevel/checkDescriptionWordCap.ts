import { countReadingWords } from "../../readTime/countReadingWords";
import type { CheckOutcome } from "./types";

export function checkDescriptionWordCap(
	body: string,
	cap: number,
): CheckOutcome {
	const { prose, code } = countReadingWords(body);
	const words = prose + code;
	if (words > cap)
		return {
			status: "fail",
			reason: `${words} words, ${words - cap} over the ${cap}-word cap`,
		};
	return { status: "pass", reason: `${words} of ${cap} words` };
}
