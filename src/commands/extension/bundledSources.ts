import { build } from "esbuild";

export async function bundledSources(entry: string): Promise<string[]> {
	const { metafile } = await build({
		entryPoints: [entry],
		bundle: true,
		write: false,
		metafile: true,
		outdir: "out",
		jsx: "automatic",
		loader: { ".woff2": "empty", ".ttf": "empty" },
		define: { __ASSIST_VERSION__: '""' },
		logLevel: "silent",
	});
	return Object.keys(metafile.inputs).filter(
		(input) => !input.startsWith("node_modules/"),
	);
}
