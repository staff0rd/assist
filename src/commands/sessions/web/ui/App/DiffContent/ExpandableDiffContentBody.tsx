import { diffBodyProps } from "./diffBodyProps";
import { DiffContentBody } from "./DiffContentBody";
import { DiffHeadSourceProvider } from "./DiffHeadSourceProvider";
import type { useDiffContent } from "./useDiffContent";

export function ExpandableDiffContentBody({
	diff,
	cwd,
}: {
	diff: ReturnType<typeof useDiffContent>;
	cwd: string;
}) {
	return (
		<DiffHeadSourceProvider
			cwd={cwd}
			scope={diff.scopeState.scope}
			conversation={diff.conversation}
			files={diff.files}
		>
			<DiffContentBody {...diffBodyProps(diff, cwd)} />
		</DiffHeadSourceProvider>
	);
}
