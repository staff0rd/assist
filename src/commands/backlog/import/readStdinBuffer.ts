/** Read all of stdin into one buffer, preserving the dump's bytes verbatim. */
export async function readStdinBuffer(): Promise<Buffer> {
	const chunks: Buffer[] = [];
	for await (const chunk of process.stdin) {
		chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
	}
	return Buffer.concat(chunks);
}
