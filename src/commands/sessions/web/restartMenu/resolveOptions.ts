import { restartDaemon } from "../../daemon/restartDaemon";
import { type MenuItem, menuItems } from "./menuItems";
import { type ReExecDeps, reExecWebServer } from "./reExecWebServer";

const CTRL_G = String.fromCharCode(7);

export type RestartMenuOptions = {
	toggleKey?: string;
	stdin?: NodeJS.ReadStream;
	out?: NodeJS.WriteStream;
	exit?: (code: number) => void;
	restartDaemonFn?: () => Promise<void>;
	reExecFn?: (deps: ReExecDeps) => void;
	items?: MenuItem[];
};

export function resolveOptions(options: RestartMenuOptions) {
	return {
		stdin: options.stdin ?? process.stdin,
		out: options.out ?? process.stdout,
		toggleKey: options.toggleKey ?? CTRL_G,
		exit: options.exit ?? ((code: number) => process.exit(code)),
		restartDaemonFn: options.restartDaemonFn ?? restartDaemon,
		reExecFn: options.reExecFn ?? reExecWebServer,
		items: options.items ?? menuItems,
	};
}
