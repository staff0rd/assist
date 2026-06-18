/**
 * Wraps an enquirer prompt promise so that Ctrl-C exits cleanly
 * instead of printing an unhandled rejection.
 *
 * Enquirer rejects with an empty string (or undefined) when the
 * user cancels a prompt with Ctrl-C or Escape.
 */
export async function exitOnCancel<T>(promise: Promise<T>): Promise<T> {
	try {
		return await promise;
	} catch (error) {
		if (error === "" || error === undefined) {
			process.exit(0);
		}
		throw error;
	}
}
