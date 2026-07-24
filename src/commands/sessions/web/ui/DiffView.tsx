import Box from "@mui/material/Box";
import { useState } from "react";
import { parseDiff, type ViewType } from "react-diff-view";
import { DiffToolbar } from "./DiffToolbar";
import { diffSx } from "./diffSx";
import { FileDiff, fileKey } from "./FileDiff";
import { PageShell } from "./PageShell";
import { useDiff } from "./useDiff";
import { useRepoSelectionContext } from "./useRepoSelectionContext";

export function DiffView() {
	const { selectedCwd } = useRepoSelectionContext();
	const { diff, loading, error } = useDiff(selectedCwd);
	const [viewType, setViewType] = useState<ViewType>("split");

	const files = error || !diff ? [] : parseDiff(diff);

	return (
		<PageShell
			loading={loading}
			isEmpty={files.length === 0}
			emptyMessage={error ? "Failed to load diff." : "No working-tree changes."}
			maxWidth={false}
		>
			<DiffToolbar viewType={viewType} onChange={setViewType} />
			<Box sx={diffSx}>
				{files.map((file) => (
					<FileDiff key={fileKey(file)} file={file} viewType={viewType} />
				))}
			</Box>
		</PageShell>
	);
}
