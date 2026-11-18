import { ghFailure } from "../../../shared/ghFailure";
import { ghRawFileAtSha } from "../../../shared/ghRawFileAtSha";

export async function fetchFileAtSha(
	repo: string,
	sha: string,
	path: string,
): Promise<string> {
	try {
		return await ghRawFileAtSha(repo, sha, path, 64 * 1024 * 1024);
	} catch (error) {
		throw new Error(
			`Could not read ${path} at PR head ${sha.slice(0, 7)}: ${ghFailure(error)}`,
		);
	}
}
