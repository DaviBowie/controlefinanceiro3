export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  isAnalysis?: boolean;
}
