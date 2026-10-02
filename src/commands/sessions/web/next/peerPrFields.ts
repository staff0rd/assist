export const peerPrFields = `number
        title
        url
        createdAt
        isDraft
        author { login }
        reviewRequests(first: 50) {
          nodes { requestedReviewer { ... on User { login } } }
        }
        latestReviews(first: 50) {
          nodes { author { login } state }
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
        }`;
