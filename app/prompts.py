"""Prompt templates for LLM interactions."""

SYSTEM_PROMPT = """You are a senior data analyst with expertise in exploratory data analysis. 
You interpret structured dataset profiles and produce accurate, actionable insights. 
You must not hallucinate statistics or column names - only use information provided in the dataset profile.
Always generate valid matplotlib code that references actual columns from the dataset."""

INSIGHT_GENERATION_PROMPT = """Given the following dataset profile in JSON format, generate exactly 3 data-driven insights.

Dataset Profile:
{profile_json}

For each insight, provide:
1. title: A concise, descriptive title (max 50 characters)
2. description: A clear explanation of the insight (2-3 sentences)
3. rationale: Why this insight matters or what it reveals (1-2 sentences)
4. chart_code: Valid matplotlib Python code to visualize this insight. The code should:
   - Use the variable 'df' which is already loaded with the dataset (DO NOT use pd.read_csv, pd.read_json, or any file reading operations)
   - Use matplotlib.pyplot as plt (already imported)
   - Use the dataset columns mentioned in the profile
   - Save the figure using plt.savefig('chart.png', dpi=150, bbox_inches='tight')
   - Include plt.close() at the end
   - NOT use seaborn or any other libraries beyond matplotlib and pandas
   - Reference columns that actually exist in the profile
   - Example: plt.scatter(df['column1'], df['column2']) - use 'df' directly, not pd.read_csv()
5. confidence: A confidence score between 0 and 1

Return your response as a JSON array with exactly 3 insight objects. Each object should have the fields: title, description, rationale, chart_code, and confidence.

Example format:
[
  {{
    "title": "Strong Correlation Detected",
    "description": "Columns X and Y show a correlation of 0.85, indicating a strong positive relationship.",
    "rationale": "This suggests that changes in X are likely to be associated with changes in Y, which could inform predictive modeling.",
    "chart_code": "plt.scatter(df['X'], df['Y'])\\nplt.xlabel('X')\\nplt.ylabel('Y')\\nplt.title('Correlation between X and Y')\\nplt.savefig('chart.png', dpi=150, bbox_inches='tight')\\nplt.close()",
    "confidence": 0.9
  }},
  ...
]

IMPORTANT: Only reference columns that exist in the dataset profile. Do not invent column names."""

SUMMARY_GENERATION_PROMPT = """Based on the following dataset profile and insights, write a concise executive summary (100-150 words) that:

1. Provides an overview of the dataset (size, key characteristics)
2. Highlights the most important insights
3. Mentions any data quality concerns (missing values, etc.)
4. Concludes with actionable recommendations

Dataset Profile:
{profile_json}

Key Insights:
{insights_summary}

Write the executive summary now:"""

