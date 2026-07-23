import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { Diff, type FileData, Hunk, type ViewType } from "react-diff-view";
import { FileDiffHeader } from "./FileDiffHeader";
import { useDiffTokens } from "./useDiffTokens";

export function fileKey(file: FileData): string {
	return `${file.oldRevision}-${file.newRevision}-${file.newPath || file.oldPath}`;
}

function filePath(file: FileData): string {
	return file.newPath && file.newPath !== "/dev/null"
		? file.newPath
		: file.oldPath;
}

function BinaryNotice() {
	return (
		<Typography
			variant="body2"
			color="text.secondary"
			sx={{ fontFamily: "monospace", py: 1 }}
		>
			Binary file — no preview.
		</Typography>
	);
}

export function FileDiff({
	file,
	viewType,
}: {
	file: FileData;
	viewType: ViewType;
}) {
	const [collapsed, setCollapsed] = useState(false);
	const path = filePath(file);
	const tokens = useDiffTokens(file.hunks, path);
	const isBinary = file.hunks.length === 0;

	return (
		<Box sx={{ mb: 3 }}>
			<FileDiffHeader
				path={path}
				collapsed={collapsed}
				onToggle={() => setCollapsed((c) => !c)}
			/>
			{!collapsed &&
				(isBinary ? (
					<BinaryNotice />
				) : (
					<Diff
						diffType={file.type}
						hunks={file.hunks}
						viewType={viewType}
						tokens={tokens}
					>
						{(hunks) =>
							hunks.map((hunk) => <Hunk key={hunk.content} hunk={hunk} />)
						}
					</Diff>
				))}
		</Box>
	);
}
