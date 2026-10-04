import { build } from "esbuild";

export async function bundledSources(entry: string): Promise<string[]> {
	const { metafile } = await build({
		entryPoints: [entry],
		bundle: true,
		write: false,
		metafile: true,
		jsx: "automatic",
		logLevel: "silent",
	});
	return Object.keys(metafile.inputs).filter(
		(input) => !input.startsWith("node_modules/"),
	);
}
