export type ActiveTab = "learn" | "review" | "progress" | "settings";

export interface LearningContent {
  summary: string;
  analogy: string;
  detailed_explanation: string;
  key_takeaways: string[];
  interactive_prompt: string;
}

export interface SymbiosisDataset {
  user_feedback_received: string | null;
  correction_applied: string | null;
  ready_for_vault: boolean;
}

export interface LearnResponse {
  status: string;
  timestamp: string;
  topic: string;
  action_type: "teach" | "review" | "self_correct" | "quiz";
  learning_content: LearningContent;
  symbiosis_dataset: SymbiosisDataset;
}

export interface ProgressItem {
  id: string;
  topic: string;
  date: string;
  masteryScore: number;
}
