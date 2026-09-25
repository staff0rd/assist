import { Diff, type FileData, Hunk, type ViewType } from "react-diff-view";
import { BinaryNotice } from "./FileDiffBody/BinaryNotice";
import { useDiffTokens } from "./FileDiffBody/useDiffTokens";

export function FileDiffBody({
	file,
	path,
	viewType,
}: {
	file: FileData;
	path: string;
	viewType: ViewType;
}) {
	const tokens = useDiffTokens(file.hunks, path);

	if (file.hunks.length === 0) return <BinaryNotice />;

	return (
		<Diff
			diffType={file.type}
			hunks={file.hunks}
			viewType={viewType}
			tokens={tokens}
		>
			{(hunks) => hunks.map((hunk) => <Hunk key={hunk.content} hunk={hunk} />)}
		</Diff>
	);
}
