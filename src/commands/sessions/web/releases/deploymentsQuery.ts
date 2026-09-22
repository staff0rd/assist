const DEPLOYMENT_PAGE = 100;

const COMMIT_FIELDS = "oid messageHeadline author{ name }";

export function deploymentsQuery(environments: string[]): string {
	return `query($owner:String!,$name:String!){
  repository(owner:$owner,name:$name){
    defaultBranchRef{ name target{ ... on Commit { ${COMMIT_FIELDS} } } }
    deployments(environments:${JSON.stringify(environments)}, last:${DEPLOYMENT_PAGE}, orderBy:{field:CREATED_AT,direction:ASC}){
      nodes{ environment createdAt commitOid commit{ ${COMMIT_FIELDS} } latestStatus{ state createdAt } }
    }
  }
}`;
}
