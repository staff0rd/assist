export function failTranscript(message: string): never {
	console.error(`Error: ${message}`);
	process.exit(1);
}
