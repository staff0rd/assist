export function logChildClose(
	name: string,
	code: number,
	elapsedSeconds: number,
	stderr: string,
): void {
	if (code === 0) {
		console.log(`[${name}] done in ${elapsedSeconds}s`);
		return;
	}
	console.error(`[${name}] exited with code ${code} in ${elapsedSeconds}s`);
	if (stderr) console.error(stderr.trim());
}
