import { ghJson } from "./ghJson";

type CompareResponse = {
	data?: {
		repository?: {
			ref?: Record<string, { behindBy?: number } | null> | null;
		} | null;
	};
};

function compareQuery(shas: string[]): string {
	const compares = shas.map(
		(sha, index) =>
			`c${index}: compare(headRef:${JSON.stringify(sha)}){ behindBy }`,
	);
	return `query($owner:String!,$name:String!,$base:String!){
  repository(owner:$owner,name:$name){
    ref(qualifiedName:$base){ ${compares.join(" ")} }
  }
}`;
}

export async function commitsBehind(
	cwd: string,
	repo: string,
	base: string,
	shas: string[],
): Promise<Map<string, number | null>> {
	const behind = new Map<string, number | null>(shas.map((sha) => [sha, null]));
	const [owner, name] = repo.split("/");
	if (shas.length === 0 || !owner || !name) return behind;
	try {
		const response = await ghJson<CompareResponse>(cwd, [
			"api",
			"graphql",
			"-f",
			`query=${compareQuery(shas)}`,
			"-f",
			`owner=${owner}`,
			"-f",
			`name=${name}`,
			"-f",
			`base=refs/heads/${base}`,
		]);
		const ref = response.data?.repository?.ref;
		for (const [index, sha] of shas.entries()) {
			const count = ref?.[`c${index}`]?.behindBy;
			behind.set(sha, typeof count === "number" ? count : null);
		}
	} catch {
		return behind;
	}
	return behind;
}
