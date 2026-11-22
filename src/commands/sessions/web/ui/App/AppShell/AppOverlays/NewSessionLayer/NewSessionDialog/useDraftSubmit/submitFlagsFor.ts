import type { SubmitFlags } from "./submitDraft";

export function submitFlagsFor(e: {
	shiftKey: boolean;
	ctrlKey: boolean;
}): SubmitFlags {
	return { open: e.shiftKey, yolo: e.shiftKey && e.ctrlKey };
}
