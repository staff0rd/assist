import { join } from "node:path";
import type { NodeSearchEnv } from "./NodeSpecResolution";

type VersionRoot = { dir: string; nodeIn: (versionDir: string) => string[] };

export function versionRoots({
	home,
	env,
	platform,
}: NodeSearchEnv): VersionRoot[] {
	const fnmDirs = present([
		env.FNM_DIR,
		join(home, ".local", "share", "fnm"),
		join(home, ".fnm"),
		env.APPDATA && join(env.APPDATA, "fnm"),
		env.XDG_DATA_HOME && join(env.XDG_DATA_HOME, "fnm"),
	]);
	const nvmDirs = present([env.NVM_DIR, join(home, ".nvm")]);
	return [
		...fnmDirs.map((dir) => ({
			dir: join(dir, "node-versions"),
			nodeIn: (v: string) => nodeBinaries(join(v, "installation"), platform),
		})),
		...nvmDirs.map((dir) => ({
			dir: join(dir, "versions", "node"),
			nodeIn: (v: string) => nodeBinaries(v, platform),
		})),
		...present([env.NVM_HOME]).map((dir) => ({
			dir,
			nodeIn: (v: string) => [join(v, "node.exe")],
		})),
		{
			dir: join(home, ".volta", "tools", "image", "node"),
			nodeIn: (v: string) => nodeBinaries(v, platform),
		},
	];
}

function present(dirs: (string | undefined)[]): string[] {
	return dirs.filter((dir): dir is string => Boolean(dir));
}

function nodeBinaries(dir: string, platform: NodeJS.Platform): string[] {
	return platform === "win32"
		? [join(dir, "node.exe")]
		: [join(dir, "bin", "node")];
}
