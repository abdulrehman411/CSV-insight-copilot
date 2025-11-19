import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export interface AnalyzeResponse {
  dataset_overview: string;
  insights: Insight[];
  summary: string;
  charts: string[];
  markdown_report?: string;
  html_report?: string;
  profile?: {
    n_rows: number;
    n_cols: number;
    columns: string[];
    dtypes: Record<string, string>;
    null_counts: Record<string, number>;
    unique_counts: Record<string, number>;
  };
}

export interface Insight {
  title: string;
  description: string;
  rationale: string;
  chart_code: string;
  chart_path?: string;
  confidence: number;
}

export const analyzeCSV = async (file: File): Promise<AnalyzeResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post<AnalyzeResponse>('/analyze', formData);
  return response.data;
};

