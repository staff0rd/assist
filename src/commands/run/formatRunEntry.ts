import type { RunConfig } from "../../shared/types";
import type { RunEntrySource } from "./RunEntrySource";

type RunParam = NonNullable<RunConfig["params"]>[number];

function formatRunSource(source: RunEntrySource): string {
	switch (source.kind) {
		case "global":
			return `global (${source.path})`;
		case "user":
			return "user (shared db)";
		case "repo":
			return source.from === "db"
				? "repo override (shared db)"
				: "repo override (~/.assist.yml repos)";
		case "project":
			return `project (${source.path})`;
	}
}

function formatParam(param: RunParam): string {
	const attrs = [
		param.required ? "required" : undefined,
		param.default !== undefined ? `default ${param.default}` : undefined,
		param.description,
	].filter((a) => a !== undefined);
	return attrs.length ? `${param.name} (${attrs.join(", ")})` : param.name;
}

function propertyLines(config: RunConfig): [string, string][] {
	const lines: [string, string | undefined][] = [
		["cwd", config.cwd],
		[
			"env",
			config.env &&
				Object.entries(config.env)
					.map(([k, v]) => `${k}=${v}`)
					.join(" "),
		],
		["server", config.server === undefined ? undefined : String(config.server)],
		["port", config.port === undefined ? undefined : String(config.port)],
		["protocol", config.protocol],
		["path", config.path],
		["pre", config.pre?.join("; ")],
		["filter", config.filter],
		["quiet", config.quiet === undefined ? undefined : String(config.quiet)],
		["params", config.params?.map(formatParam).join(", ")],
	];
	return lines.filter((l): l is [string, string] => l[1] !== undefined);
}

export function formatRunEntry(
	config: RunConfig,
	source: RunEntrySource,
): string {
	const args = config.args?.length ? ` ${config.args.join(" ")}` : "";
	const props = [["source", formatRunSource(source)], ...propertyLines(config)];
	return [
		`${config.name}: ${config.command}${args}`,
		...props.map(([key, value]) => `  ${key}: ${value}`),
	].join("\n");
}
