"""Report formatting module for Markdown and HTML."""
import base64
import os
from typing import List
from app.schemas import Report, Insight, DatasetProfile


def format_markdown_report(
    profile: DatasetProfile,
    insights: List[Insight],
    summary: str,
    chart_paths: List[str]
) -> str:
    """
    Generate a Markdown report.
    
    Args:
        profile: DatasetProfile object
        insights: List of Insight objects
        summary: Executive summary string
        chart_paths: List of chart file paths
        
    Returns:
        Markdown report string
    """
    md = []
    md.append("# Dataset Analysis Report\n")
    md.append(f"## Dataset Overview\n")
    md.append(f"- **Total Rows:** {profile.n_rows:,}")
    md.append(f"- **Total Columns:** {profile.n_cols}")
    md.append(f"- **Missing Values:** {sum(profile.null_counts.values()):,} ({sum(profile.null_counts.values()) / (profile.n_rows * profile.n_cols) * 100:.2f}%)\n")
    
    md.append("### Column Information\n")
    md.append("| Column Name | Data Type | Missing Values | Unique Values |")
    md.append("|-------------|-----------|----------------|--------------|")
    
    for col in profile.columns:
        dtype_label = "Numeric" if profile.dtypes[col] == "numeric" else "Categorical"
        null_count = profile.null_counts.get(col, 0)
        null_pct = (null_count / profile.n_rows * 100) if profile.n_rows > 0 else 0
        unique_count = profile.unique_counts.get(col, 0)
        md.append(f"| {col} | {dtype_label} | {null_count} ({null_pct:.1f}%) | {unique_count} |")
    
    md.append("\n## Key Insights\n")
    
    for i, insight in enumerate(insights):
        md.append(f"### {i+1}. {insight.title}\n")
        md.append(f"**Description:** {insight.description}\n")
        md.append(f"**Rationale:** {insight.rationale}\n")
        if chart_paths and i < len(chart_paths) and chart_paths[i]:
            chart_name = os.path.basename(chart_paths[i])
            md.append(f"![Chart {i+1}]({chart_name})\n")
        md.append("---\n")
    
    md.append("\n## Executive Summary\n")
    md.append(f"{summary}\n")
    
    return "\n".join(md)


def format_html_report(
    profile: DatasetProfile,
    insights: List[Insight],
    summary: str,
    chart_paths: List[str]
) -> str:
    """
    Generate an HTML report with embedded charts.
    
    Args:
        profile: DatasetProfile object
        insights: List of Insight objects
        summary: Executive summary string
        chart_paths: List of chart file paths
        
    Returns:
        HTML report string
    """
    # Convert charts to base64 for embedding
    chart_data_uris = []
    for chart_path in chart_paths:
        if chart_path and os.path.exists(chart_path):
            with open(chart_path, 'rb') as f:
                chart_data = base64.b64encode(f.read()).decode('utf-8')
                chart_data_uris.append(f"data:image/png;base64,{chart_data}")
        else:
            chart_data_uris.append(None)
    
    html = []
    html.append("""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dataset Analysis Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f6f7f8;
        }
        h1 {
            color: #137fec;
            border-bottom: 3px solid #137fec;
            padding-bottom: 10px;
        }
        h2 {
            color: #2c3e50;
            margin-top: 30px;
        }
        h3 {
            color: #34495e;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #137fec;
            color: white;
            font-weight: bold;
        }
        tr:hover {
            background-color: #f5f5f5;
        }
        .insight-card {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .insight-card h3 {
            color: #137fec;
            margin-top: 0;
        }
        .chart-container {
            margin: 20px 0;
            text-align: center;
        }
        .chart-container img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .summary {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-left: 4px solid #137fec;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-card h3 {
            margin: 0;
            font-size: 2em;
            color: #137fec;
        }
        .stat-card p {
            margin: 10px 0 0 0;
            color: #666;
        }
    </style>
</head>
<body>""")
    
    html.append("<h1>Dataset Analysis Report</h1>")
    
    html.append("<div class='stats'>")
    html.append(f"<div class='stat-card'><h3>{profile.n_rows:,}</h3><p>Total Rows</p></div>")
    html.append(f"<div class='stat-card'><h3>{profile.n_cols}</h3><p>Total Columns</p></div>")
    missing_total = sum(profile.null_counts.values())
    missing_pct = (missing_total / (profile.n_rows * profile.n_cols) * 100) if profile.n_rows * profile.n_cols > 0 else 0
    html.append(f"<div class='stat-card'><h3>{missing_pct:.1f}%</h3><p>Missing Values</p></div>")
    html.append("</div>")
    
    html.append("<h2>Dataset Overview</h2>")
    html.append("<table>")
    html.append("<tr><th>Column Name</th><th>Data Type</th><th>Missing Values</th><th>Unique Values</th></tr>")
    
    for col in profile.columns:
        dtype_label = "Numeric" if profile.dtypes[col] == "numeric" else "Categorical"
        null_count = profile.null_counts.get(col, 0)
        null_pct = (null_count / profile.n_rows * 100) if profile.n_rows > 0 else 0
        unique_count = profile.unique_counts.get(col, 0)
        html.append(f"<tr><td>{col}</td><td>{dtype_label}</td><td>{null_count} ({null_pct:.1f}%)</td><td>{unique_count}</td></tr>")
    
    html.append("</table>")
    
    html.append("<h2>Key Insights</h2>")
    
    for i, insight in enumerate(insights):
        html.append("<div class='insight-card'>")
        html.append(f"<h3>{i+1}. {insight.title}</h3>")
        html.append(f"<p><strong>Description:</strong> {insight.description}</p>")
        html.append(f"<p><strong>Rationale:</strong> {insight.rationale}</p>")
        if chart_data_uris and i < len(chart_data_uris) and chart_data_uris[i]:
            html.append(f"<div class='chart-container'><img src='{chart_data_uris[i]}' alt='Chart {i+1}' /></div>")
        html.append("</div>")
    
    html.append("<div class='summary'>")
    html.append("<h2>Executive Summary</h2>")
    html.append(f"<p>{summary}</p>")
    html.append("</div>")
    
    html.append("</body></html>")
    
    return "\n".join(html)


def generate_reports(profile: DatasetProfile, insights: List[Insight], summary: str, chart_paths: List[str]) -> tuple[str, str]:
    """
    Generate both Markdown and HTML reports.
    
    Args:
        profile: DatasetProfile object
        insights: List of Insight objects
        summary: Executive summary string
        chart_paths: List of chart file paths
        
    Returns:
        Tuple of (markdown_report, html_report)
    """
    md_report = format_markdown_report(profile, insights, summary, chart_paths)
    html_report = format_html_report(profile, insights, summary, chart_paths)
    return md_report, html_report

