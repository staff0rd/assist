import { CommentSentSnackbar } from "../CommentSentSnackbar";
import { DiffRevertSnackbar } from "./DiffSnackbars/DiffRevertSnackbar";

export function DiffSnackbars({
	sentTo,
	clearSent,
	revertError,
	clearRevertError,
}: {
	sentTo: string | null;
	clearSent: () => void;
	revertError: string | null;
	clearRevertError: () => void;
}) {
	return (
		<>
			<CommentSentSnackbar sessionName={sentTo} onClose={clearSent} />
			<DiffRevertSnackbar error={revertError} onClose={clearRevertError} />
		</>
	);
}
