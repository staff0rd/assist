import chalk from "chalk";
import type { MenuItem } from "./menuItems";

export function renderRestartMenu(items: MenuItem[], selected: number): string {
	const lines = [chalk.bold.cyan("assist — restart menu")];
	items.forEach((item, i) => {
		const active = i === selected;
		const pointer = active ? chalk.cyan("❯ ") : "  ";
		const number = chalk.dim(`${i + 1}. `);
		const note = item.note ? chalk.dim(` (${item.note})`) : "";
		let label = item.label;
		if (item.disabled) label = chalk.dim(label);
		else if (active) label = chalk.cyan.bold(label);
		lines.push(`${pointer}${number}${label}${note}`);
	});
	lines.push(chalk.dim("↑/↓ move · 1-3 jump · enter select · esc close"));
	return lines.join("\n");
}
