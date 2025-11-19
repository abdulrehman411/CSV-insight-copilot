"""Pydantic v2 models for data validation."""
from pydantic import BaseModel, Field
from typing import List, Dict, Optional


class DatasetProfile(BaseModel):
    """Dataset profiling information."""
    columns: List[str]
    dtypes: Dict[str, str]
    null_counts: Dict[str, int]
    summary_stats: Dict[str, Dict[str, float]]
    correlations: Dict[str, Dict[str, float]]
    n_rows: int
    n_cols: int
    unique_counts: Dict[str, int] = Field(default_factory=dict)


class Insight(BaseModel):
    """A single data insight."""
    title: str
    description: str
    rationale: str
    chart_code: str
    chart_path: Optional[str] = None
    confidence: float = Field(ge=0, le=1, default=0.8)


class Report(BaseModel):
    """Complete analysis report."""
    dataset_overview: str
    insights: List[Insight]
    summary: str
    charts: List[Optional[str]]  # Chart paths or base64 data (can be None if chart generation fails)
    markdown_report: Optional[str] = None
    html_report: Optional[str] = None

