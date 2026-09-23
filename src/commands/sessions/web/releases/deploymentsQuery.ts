const DEPLOYMENTS_PER_ENVIRONMENT = 50;

const COMMIT_FIELDS = "oid messageHeadline author{ name }";

export function deploymentsAlias(index: number): string {
	return `env${index}`;
}

function environmentDeployments(environment: string, index: number): string {
	return `${deploymentsAlias(index)}: deployments(environments:${JSON.stringify([environment])}, last:${DEPLOYMENTS_PER_ENVIRONMENT}, orderBy:{field:CREATED_AT,direction:ASC}){
      nodes{ environment createdAt commitOid commit{ ${COMMIT_FIELDS} } latestStatus{ state createdAt } }
    }`;
}

export function deploymentsQuery(environments: string[]): string {
	return `query($owner:String!,$name:String!){
  repository(owner:$owner,name:$name){
    defaultBranchRef{ name target{ ... on Commit { ${COMMIT_FIELDS} } } }
    ${environments.map(environmentDeployments).join("\n    ")}
  }
}`;
}
