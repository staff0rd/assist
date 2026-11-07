type SelectionHandler = { postMessage: (commentable: boolean) => void };

type WebkitGlobal = typeof globalThis & {
	webkit?: { messageHandlers?: { assistSelection?: SelectionHandler } };
};

function selectionHandler(): SelectionHandler | undefined {
	return (globalThis as WebkitGlobal).webkit?.messageHandlers?.assistSelection;
}

export const nativeCommentMenu = {
	event: "assist:comment-selection",
	available: () => selectionHandler() !== undefined,
	setCommentable: (commentable: boolean) =>
		selectionHandler()?.postMessage(commentable),
};
