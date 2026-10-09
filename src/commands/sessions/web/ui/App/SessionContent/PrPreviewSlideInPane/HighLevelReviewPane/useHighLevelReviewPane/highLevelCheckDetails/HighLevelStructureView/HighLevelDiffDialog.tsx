import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import type { HighLevelTreeFile } from "../../../../../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "../../HighLevelDiffComments";
import { HighLevelDiffDialogNav } from "./HighLevelDiffDialog/HighLevelDiffDialogNav";
import { HighLevelDiffDialogTitle } from "./HighLevelDiffDialog/HighLevelDiffDialogTitle";
import { HighLevelNativeDiff } from "../HighLevelNativeDiff";
import { useDiffViewType } from "../../../../../../useDiffViewType";

export function HighLevelDiffDialog({
	files,
	file,
	onSelect,
	onClose,
	comments,
}: {
	files: HighLevelTreeFile[];
	file: HighLevelTreeFile;
	onSelect: (file: HighLevelTreeFile) => void;
	onClose: () => void;
	comments?: HighLevelDiffComments | undefined;
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
					comments={comments}
				/>
			</DialogContent>
			<DialogActions>
				<HighLevelDiffDialogNav files={files} file={file} onSelect={onSelect} />
				<Button onClick={onClose}>Close</Button>
			</DialogActions>
		</Dialog>
	);
}
