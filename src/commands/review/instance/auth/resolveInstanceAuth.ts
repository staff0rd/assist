import { resolve } from "node:path";
import { expandTilde } from "../../../../shared/expandTilde";
import type { AssistConfig } from "../../../../shared/types";
import type { InstanceAuth } from "./InstanceAuth";

type AuthConfig = NonNullable<
	NonNullable<NonNullable<AssistConfig["review"]>["instance"]>["auth"]
>;

const KEY = "review.instance.auth.loginScript";

export function resolveInstanceAuth(
	auth: AuthConfig | undefined,
	repoRoot: string,
): InstanceAuth | undefined {
	if (!auth?.strategy) return undefined;
	const script = auth.loginScript?.script;
	if (!script)
		throw new Error(
			`${KEY}.script is not set; point it at a login script with \`assist config set ${KEY}.script <file>\``,
		);
	const password = auth.loginScript?.password;
	if (!password)
		throw new Error(
			`${KEY}.password is not set; set the credentials secret with \`assist config set --node ${KEY}.password <password>\``,
		);
	return {
		strategy: auth.strategy,
		script: resolve(repoRoot, expandTilde(script)),
		credentials: { username: auth.loginScript?.username, password },
	};
}
