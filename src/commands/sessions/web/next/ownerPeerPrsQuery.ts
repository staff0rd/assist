import { peerPrFields } from "./peerPrFields";

export const ownerPeerPrsQuery = `query($requested: String!, $authored: String!, $hasPeers: Boolean!) {
  viewer { login }
  requested: search(query: $requested, type: ISSUE, first: 100) {
    nodes { ... on PullRequest { repository { nameWithOwner } ${peerPrFields} } }
  }
  authored: search(query: $authored, type: ISSUE, first: 100) @include(if: $hasPeers) {
    nodes { ... on PullRequest { repository { nameWithOwner } ${peerPrFields} } }
  }
}`;
