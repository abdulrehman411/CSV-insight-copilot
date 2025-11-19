"""CSV profiling and analysis module."""
import pandas as pd
import numpy as np
from typing import Dict, Any
from app.schemas import DatasetProfile
from app.config import MAX_COLUMNS


def detect_column_type(series: pd.Series) -> str:
    """Detect if a column is numeric or categorical."""
    if pd.api.types.is_numeric_dtype(series):
        return "numeric"
    else:
        return "categorical"


def calculate_summary_stats(df: pd.DataFrame) -> Dict[str, Dict[str, float]]:
    """Calculate summary statistics for numeric columns."""
    stats = {}
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    
    for col in numeric_cols:
        stats[col] = {
            "mean": float(df[col].mean()) if not df[col].isna().all() else 0.0,
            "median": float(df[col].median()) if not df[col].isna().all() else 0.0,
            "std": float(df[col].std()) if not df[col].isna().all() else 0.0,
            "min": float(df[col].min()) if not df[col].isna().all() else 0.0,
            "max": float(df[col].max()) if not df[col].isna().all() else 0.0,
        }
    
    return stats


def calculate_correlations(df: pd.DataFrame) -> Dict[str, Dict[str, float]]:
    """Calculate correlation matrix for numeric columns."""
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    
    if len(numeric_cols) == 0:
        return {}
    
    corr_matrix = df[numeric_cols].corr()
    
    # Convert to nested dictionary
    correlations = {}
    for col1 in corr_matrix.columns:
        correlations[col1] = {}
        for col2 in corr_matrix.columns:
            correlations[col1][col2] = float(corr_matrix.loc[col1, col2])
    
    return correlations


def profile_dataset(file_path: str) -> DatasetProfile:
    """
    Profile a CSV dataset and return structured information.
    
    Args:
        file_path: Path to the CSV file
        
    Returns:
        DatasetProfile object with dataset information
    """
    # Read CSV with error handling
    try:
        df = pd.read_csv(file_path, encoding='utf-8')
    except UnicodeDecodeError:
        # Try with different encoding
        df = pd.read_csv(file_path, encoding='latin-1')
    
    # Validate column count
    if len(df.columns) > MAX_COLUMNS:
        raise ValueError(f"Dataset has {len(df.columns)} columns. Maximum allowed is {MAX_COLUMNS}.")
    
    # Get column information
    columns = df.columns.tolist()
    dtypes = {}
    null_counts = {}
    unique_counts = {}
    
    for col in columns:
        dtypes[col] = detect_column_type(df[col])
        null_counts[col] = int(df[col].isna().sum())
        unique_counts[col] = int(df[col].nunique())
    
    # Calculate summary statistics
    summary_stats = calculate_summary_stats(df)
    
    # Calculate correlations
    correlations = calculate_correlations(df)
    
    return DatasetProfile(
        columns=columns,
        dtypes=dtypes,
        null_counts=null_counts,
        summary_stats=summary_stats,
        correlations=correlations,
        n_rows=int(len(df)),
        n_cols=int(len(columns)),
        unique_counts=unique_counts
    )

