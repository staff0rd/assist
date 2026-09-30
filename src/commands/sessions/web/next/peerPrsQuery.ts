export const peerPrsQuery = `query($owner: String!, $name: String!) {
  viewer { login }
  repository(owner: $owner, name: $name) {
    pullRequests(states: OPEN, first: 100, orderBy: { field: CREATED_AT, direction: ASC }) {
      nodes {
        number
        title
        url
        createdAt
        isDraft
        author { login }
        reviewRequests(first: 50) {
          nodes { requestedReviewer { ... on User { login } } }
        }
        latestReviews(first: 50) {
          nodes { author { login } state commit { oid } }
        }
        commits(last: 1) {
          nodes { commit { oid statusCheckRollup { state } } }
        }
        timelineItems(itemTypes: [REVIEW_REQUESTED_EVENT], last: 50) {
          nodes {
            ... on ReviewRequestedEvent {
              createdAt
              requestedReviewer { ... on User { login } }
            }
          }
        }
      }
    }
  }
}`;
