import { useCallback, useEffect, useRef, useState } from "react";
import {
	loadPersistedComments,
	type PersistedComment,
	prunePersistedComments,
	savePersistedComments,
} from "./PersistedComment";

export type LocalComment = PersistedComment & { id: number };

export function usePrComments(requestId: string) {
	const [comments, setComments] = useState<LocalComment[]>([]);
	const nextId = useRef(0);

	useEffect(() => {
		prunePersistedComments();
		setComments(
			loadPersistedComments(requestId).map((p) => ({
				...p,
				id: nextId.current++,
			})),
		);
	}, [requestId]);

	const add = useCallback(
		(comment: PersistedComment) => {
			setComments((cs) => {
				const next = [...cs, { ...comment, id: nextId.current++ }];
				savePersistedComments(requestId, next);
				return next;
			});
		},
		[requestId],
	);

	const remove = useCallback(
		(id: number) => {
			setComments((cs) => {
				const next = cs.filter((c) => c.id !== id);
				savePersistedComments(requestId, next);
				return next;
			});
		},
		[requestId],
	);

	return { comments, add, remove };
}
