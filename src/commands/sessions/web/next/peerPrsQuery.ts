import { peerPrFields } from "./peerPrFields";

export const peerPrsQuery = `query($owner: String!, $name: String!) {
  viewer { login }
  repository(owner: $owner, name: $name) {
    pullRequests(states: OPEN, first: 100, orderBy: { field: CREATED_AT, direction: ASC }) {
      nodes {
        ${peerPrFields}
      }
    }
  }
}`;
