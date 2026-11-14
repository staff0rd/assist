export function wrapRestartNudge(text: string, killed: number): string {
	return `<assist-restart killed="${killed}">${text}</assist-restart>`;
}
