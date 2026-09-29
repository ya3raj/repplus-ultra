export const REPPLUS_CAPABILITIES = [
  "history", "capture-settings", "multi-tab", "replay", "response-history", "timeline",
  "starring", "color-tags", "blocking", "forwarding", "workspace-clear", "workspace-import",
  "workspace-export", "undo-redo", "bulk-replay", "bulk-job-control", "extract-secrets",
  "extract-endpoints", "extract-parameters", "response-search", "attack-surface", "evidence-screenshot"
] as const;

export type RepPlusCapability = typeof REPPLUS_CAPABILITIES[number];
