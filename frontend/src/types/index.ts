export interface User {
  id: number;
  full_name: string;
  email: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Label {
  id: number;
  name: string;
  description?: string | null;
  color?: string | null;
}

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  labeling_mode: string;
  status: string;
  created_at: string;
  labels: Label[];
}

export interface Annotation {
  id: number;
  label_id?: number | null;
  notes?: string | null;
  updated_at: string;
  annotator_id: number;
}

export interface RecordItem {
  id: number;
  external_id?: string | null;
  content: string;
  metadata_json?: string | null;
  ai_prediction?: string | null;
  ai_confidence?: string | null;
  annotations: Annotation[];
}

export interface Analytics {
  total_records: number;
  annotated_records: number;
  pending_records: number;
  agreement_with_ai_percent: number;
  label_breakdown: Record<string, number>;
}
