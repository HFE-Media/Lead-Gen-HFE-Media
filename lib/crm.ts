export const LEAD_STATUSES = ["new", "contacted", "interested", "quoted", "won", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const CALL_OUTCOMES = [
  "no_answer",
  "wrong_number",
  "not_interested",
  "call_back_later",
  "interested",
  "quoted",
  "won",
  "lost"
] as const;
export type CallOutcome = (typeof CALL_OUTCOMES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  interested: "Interested",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost"
};

export const CALL_OUTCOME_LABELS: Record<CallOutcome, string> = {
  no_answer: "No answer",
  wrong_number: "Wrong number",
  not_interested: "Not interested",
  call_back_later: "Call back later",
  interested: "Interested",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost"
};

export function isLeadStatus(value: string): value is LeadStatus {
  return LEAD_STATUSES.includes(value as LeadStatus);
}

export function isCallOutcome(value: string): value is CallOutcome {
  return CALL_OUTCOMES.includes(value as CallOutcome);
}
