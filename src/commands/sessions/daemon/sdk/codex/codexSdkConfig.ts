type CodexSdkConfig = {
	configOverrides: string[];
	additionalDirectories: string[];
	model?: string;
};

/* why: assist builds Codex launch flags as CLI args for the terminal harness;
 * the SDK takes the same settings as --config overrides and thread options. */
export function codexSdkConfig(args: readonly string[]): CodexSdkConfig {
	const config: CodexSdkConfig = {
		configOverrides: [],
		additionalDirectories: [],
	};
	for (let i = 0; i < args.length; i += 2) {
		const [flag, value] = [args[i], args[i + 1]];
		if (value === undefined) throw new Error(`codex flag ${flag} has no value`);
		if (flag === "-c") config.configOverrides.push(value);
		else if (flag === "--add-dir") config.additionalDirectories.push(value);
		else if (flag === "-m") config.model = value;
		else throw new Error(`codex flag ${flag} has no SDK equivalent`);
	}
	return config;
}
