import type { SshTarget } from "../daemon/links/LinkStatus";
import { type DoctorProbes, failed, type Hop, passed } from "./DoctorProbes";

const ONEPASSWORD_AGENT =
	'"~/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock"';

export async function agentHop(
	ssh: SshTarget,
	probes: DoctorProbes,
): Promise<Hop> {
	const agent = await probes.sshAgent(ssh.alias);
	switch (agent.status) {
		case "ok":
			return passed(
				"agent",
				`${agent.keys} key(s)${agent.socket ? ` via ${agent.socket}` : ""}`,
			);
		case "missing":
			return failed(
				"agent",
				`no IdentityAgent for ${ssh.alias} and SSH_AUTH_SOCK is unset`,
				`IdentityAgent missing — add \`IdentityAgent ${ONEPASSWORD_AGENT}\` under \`Host ${ssh.alias}\` in ~/.ssh/config`,
			);
		case "no-keys":
			return failed(
				"agent",
				`the agent${agent.socket ? ` at ${agent.socket}` : ""} holds no keys`,
				"add or import an SSH key in 1Password, then allow it in the SSH agent",
			);
		case "unreachable":
			return failed(
				"agent",
				agent.error,
				"1Password SSH agent not reachable — open and unlock 1Password and turn on Settings → Developer → Use the SSH agent",
			);
	}
}
