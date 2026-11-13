import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import type { MermaidExportOptions } from "./mermaidExport";
import { mermaidConfigHelp } from "./mermaid/mermaidConfigHelp";

export function registerMermaid(program: Command): void {
	const cmd = program
		.command("mermaid")
		.description("Render mermaid diagrams from markdown files");

	cmd
		.command("export [file]")
		.description(
			"Render fenced mermaid blocks as SVG via Kroki. With no file, scans *.md in cwd.",
		)
		.option("--out <dir>", "Output directory (default: cwd)")
		.option(
			"--index <n>",
			"Render only the nth mermaid block (1-based)",
			(value) => Number.parseInt(value, 10),
		)
		.action(async (file: string | undefined, options: MermaidExportOptions) =>
			(await import("./mermaidExport")).mermaidExport(file, options),
		);

	configHelp(cmd, mermaidConfigHelp);
}
