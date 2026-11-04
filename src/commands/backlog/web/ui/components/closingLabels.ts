export type ClosingStatus = "done" | "wontdo";

export const closingLabels: Record<
	ClosingStatus,
	{ verb: string; action: string }
> = {
	done: { verb: "done", action: "Mark done" },
	wontdo: { verb: "won't do", action: "Won't do" },
};
