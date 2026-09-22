export type ReleaseTone = "ok" | "gate" | "drift" | "fail" | "idle";

export const releaseToneColors: Record<ReleaseTone, string> = {
	ok: "success.main",
	gate: "warning.main",
	drift: "error.main",
	fail: "error.main",
	idle: "text.secondary",
};
