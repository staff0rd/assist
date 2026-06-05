export function validatePrContent(title: string, body: string): void {
	if (title.toLowerCase().includes("claude")) {
		console.error("Error: PR title must not reference Claude");
		process.exit(1);
	}

	if (body.toLowerCase().includes("claude")) {
		console.error("Error: PR body must not reference Claude");
		process.exit(1);
	}
}
