import { useState } from "react";
import { AddNodeDialog } from "./AddNodeDialog";
import { useLinkedNotice } from "./useLinkedNotice";

export function useAddNodeDialog() {
	const linked = useLinkedNotice();
	const [adding, setAdding] = useState(false);
	const dialog = adding ? (
		<AddNodeDialog
			onClose={() => setAdding(false)}
			onLinked={(notice) => {
				setAdding(false);
				linked.show(notice);
			}}
		/>
	) : null;
	return { open: () => setAdding(true), dialog, notices: linked };
}
