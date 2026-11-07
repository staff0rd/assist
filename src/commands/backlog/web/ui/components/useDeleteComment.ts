import { useState } from "react";
import { useApiNode } from "../../../../sessions/web/ui/useApiNode";
import { deleteComment } from "../deleteComment";
import { useRepoCwd } from "../useRepoCwd";

export function useDeleteComment(
	itemId: number,
	commentId: number,
	onDeleted: () => Promise<void>,
) {
	const cwd = useRepoCwd();
	const node = useApiNode();
	const [error, setError] = useState<string>();
	const remove = async () => {
		try {
			await deleteComment(itemId, commentId, cwd, node);
			await onDeleted();
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Failed to delete comment",
			);
		}
	};
	return { remove, error, clearError: () => setError(undefined) };
}
