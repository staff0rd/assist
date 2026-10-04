export type ResizeFn = (
	sessionId: string,
	cols: number,
	rows: number,
	claim?: boolean,
) => void;
