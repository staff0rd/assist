import {
	adviceFragmentNames,
	adviceFragmentTitles,
} from "../../shared/adviceFragmentNames";
import { loadAdviceFragments } from "../advise/loadAdviceFragments";
import { reportVerifyProblems, verifySection } from "./reportVerifyProblems";

const titles: Record<string, string> = adviceFragmentTitles;

export function adviceFragments(): void {
	const fragments = loadAdviceFragments();
	const shipped = new Set(fragments.map((fragment) => fragment.name));
	const declared = new Set<string>(adviceFragmentNames);

	reportVerifyProblems(
		[
			verifySection(
				"Shipped in claude/advice but missing from adviceFragmentNames (add them, or advice.sections cannot name them)",
				[...shipped].filter((name) => !declared.has(name)),
			),
			verifySection(
				"Listed in adviceFragmentNames but no longer shipped in claude/advice (remove them)",
				[...declared].filter((name) => !shipped.has(name)),
			),
			verifySection(
				"adviceFragmentTitles disagrees with the fragment's own title (the config picker shows these, so they must match)",
				fragments
					.filter((fragment) => titles[fragment.name] !== fragment.title)
					.map(
						(fragment) =>
							`${fragment.name}: "${titles[fragment.name] ?? ""}" should be "${fragment.title}"`,
					),
			),
		],
		`All ${shipped.size} advice fragments are named and titled in adviceFragmentNames.`,
	);
}
