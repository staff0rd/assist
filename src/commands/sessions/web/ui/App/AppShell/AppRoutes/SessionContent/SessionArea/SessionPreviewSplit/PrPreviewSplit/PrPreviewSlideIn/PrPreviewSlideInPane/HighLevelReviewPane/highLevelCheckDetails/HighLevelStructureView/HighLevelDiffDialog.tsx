import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import type { HighLevelTreeFile } from "../../../../../../../../../../../../../../../review/highLevel/types";
import { HighLevelDiffDialogTitle } from "./HighLevelDiffDialog/HighLevelDiffDialogTitle";
import { HighLevelNativeDiff } from "../HighLevelNativeDiff";
import { useDiffViewType } from "../../../../../../../../../useDiffViewType";

export function HighLevelDiffDialog({
	file,
	onClose,
}: {
	file: HighLevelTreeFile;
	onClose: () => void;
}) {
	const { viewType, onChange } = useDiffViewType();

	return (
		<Dialog open onClose={onClose} maxWidth="xl" fullWidth>
			<HighLevelDiffDialogTitle
				file={file}
				viewType={viewType}
				onChangeViewType={onChange}
			/>
			<DialogContent dividers>
				<HighLevelNativeDiff
					path={file.path}
					status={file.status}
					patch={file.patch ?? null}
					truncated={file.truncated === true}
					viewType={viewType}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Close</Button>
			</DialogActions>
		</Dialog>
	);
}
