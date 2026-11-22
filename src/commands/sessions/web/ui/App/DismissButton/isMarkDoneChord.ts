export const isMarkDoneChord = (e: { shiftKey: boolean; ctrlKey: boolean }) =>
	e.shiftKey && e.ctrlKey;
