export const pickupsQuery = `query($owner: String!, $number: Int!, $after: String) {
  repositoryOwner(login: $owner) {
    ... on ProjectV2Owner {
      projectV2(number: $number) {
        title
        priorityField: field(name: "Priority") {
          ... on ProjectV2SingleSelectField { options { name } }
        }
        items(first: 100, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id
            status: fieldValueByName(name: "Status") {
              ... on ProjectV2ItemFieldSingleSelectValue { name }
            }
            priority: fieldValueByName(name: "Priority") {
              ... on ProjectV2ItemFieldSingleSelectValue { name }
            }
            content {
              ... on Issue {
                number
                title
                url
                createdAt
                state
                author { login }
                repository { nameWithOwner }
                assignees(first: 1) { totalCount }
                issueType { name }
                labels(first: 20) { nodes { name } }
              }
            }
          }
        }
      }
    }
  }
}`;
