import { ConfirmDialog } from "../../../backlog/web/ui/components/ConfirmDialog";
import { repoLabel } from "./repoLabel";
import type { ServerConflict } from "./useNotices";

export function ServerConflictDialog({
	conflict,
	onConfirm,
	onCancel,
}: {
	conflict: ServerConflict;
	onConfirm: () => void;
	onCancel: () => void;
}) {
	const { name, cwd, port } = conflict.existing;
	const where = repoLabel(cwd);
	const portSuffix = port ? ` on port ${port}` : "";
	const location = where ? ` in ${where}` : "";
	return (
		<ConfirmDialog
			title="Replace running server?"
			message={`"${name}" is already serving${portSuffix}${location}. Replace it — stop the running server and start this one?`}
			confirmLabel="Replace"
			confirmColor="error"
			onConfirm={onConfirm}
			onCancel={onCancel}
		/>
	);
}
