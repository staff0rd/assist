export function previewWaitInstruction(deferredPreview: boolean): string {
	return deferredPreview
		? "in the foreground. It returns at once; then end your turn and do nothing else — when the user decides, the command's output and exit code arrive as your next message"
		: "as a background task, doing no other work until it returns. It blocks until the user decides";
}
