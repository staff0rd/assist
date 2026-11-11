import * as fs from "node:fs";

const TABLE_HEADER = /^\s*\[/;

const STATE_HEADER =
	/^\s*\[\s*hooks\.state\."((?:[^"\\]|\\.)*)"\s*\]\s*(#.*)?$/;

const TRUSTED_HASH = /^\s*trusted_hash\s*=\s*"[^"]+"/;

const DISABLED = /^\s*enabled\s*=\s*false\b/;

export function codexTrustedHookKeys(
	config: string,
	configPath: string,
): Set<string> {
	const trusted = new Set<string>();
	let current: { key: string; hash: boolean; disabled: boolean } | undefined;
	const close = () => {
		if (current?.hash && !current.disabled) trusted.add(current.key);
		current = undefined;
	};
	for (const line of config.split("\n")) {
		if (TABLE_HEADER.test(line)) {
			close();
			const quoted = STATE_HEADER.exec(line)?.[1];
			if (!quoted) continue;
			const key = JSON.parse(`"${quoted}"`) as string;
			const split = key.lastIndexOf(".toml:");
			if (split === -1) continue;
			const source = key.slice(0, split + ".toml".length);
			if (!samePath(source, configPath)) continue;
			current = {
				key: key.slice(split + ".toml:".length),
				hash: false,
				disabled: false,
			};
			continue;
		}
		if (!current) continue;
		if (TRUSTED_HASH.test(line)) current.hash = true;
		if (DISABLED.test(line)) current.disabled = true;
	}
	close();
	return trusted;
}

function samePath(a: string, b: string): boolean {
	if (a === b) return true;
	try {
		return fs.realpathSync(a) === fs.realpathSync(b);
	} catch {
		return false;
	}
}
