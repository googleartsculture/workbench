export interface ClassificationRequest {
  image: string;
  limit: number;
  model_name: string;
  model_version: string;
  original_height: number;
  original_width: number;
  threshold: number;
  weighted: boolean;
}

export interface ClassificationResult {
  glyph: string;
  score: number;
}
