export const isAssistChord = (e: {
	shiftKey: boolean;
	ctrlKey: boolean;
	altKey: boolean;
}) => e.shiftKey && e.ctrlKey && e.altKey;
