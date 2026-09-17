import { adviceFragmentNames } from "../../shared/adviceFragmentNames";
import { loadAdviceFragments } from "../advise/loadAdviceFragments";
import { reportVerifyProblems, verifySection } from "./reportVerifyProblems";

export function adviceFragments(): void {
	const shipped = new Set(
		loadAdviceFragments().map((fragment) => fragment.name),
	);
	const declared = new Set<string>(adviceFragmentNames);

	reportVerifyProblems(
		[
			verifySection(
				"Shipped in claude/advice but missing from adviceFragmentNames (add them, or advice.include/exclude cannot name them)",
				[...shipped].filter((name) => !declared.has(name)),
			),
			verifySection(
				"Listed in adviceFragmentNames but no longer shipped in claude/advice (remove them)",
				[...declared].filter((name) => !shipped.has(name)),
			),
		],
		`All ${shipped.size} advice fragments are named in adviceFragmentNames.`,
	);
}
