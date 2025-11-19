"""LLM agent for generating insights using Groq."""
import json
from typing import List
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from app.config import GROQ_API_KEY, GROQ_MODEL
from app.schemas import DatasetProfile, Insight
from app.prompts import SYSTEM_PROMPT, INSIGHT_GENERATION_PROMPT, SUMMARY_GENERATION_PROMPT


def create_groq_llm():
    """Create and return a Groq LLM instance."""
    return ChatGroq(
        groq_api_key=GROQ_API_KEY,
        model_name=GROQ_MODEL,
        temperature=0.7,
    )


def generate_insights(profile: DatasetProfile) -> List[Insight]:
    """
    Generate insights from a dataset profile using Groq LLM.
    
    Args:
        profile: DatasetProfile object
        
    Returns:
        List of Insight objects
    """
    llm = create_groq_llm()
    
    # Convert profile to JSON
    profile_dict = profile.model_dump()
    profile_json = json.dumps(profile_dict, indent=2)
    
    # Create prompt template
    system_template = SystemMessagePromptTemplate.from_template(SYSTEM_PROMPT)
    human_template = HumanMessagePromptTemplate.from_template(INSIGHT_GENERATION_PROMPT)
    
    prompt = ChatPromptTemplate.from_messages([
        system_template,
        human_template
    ])
    
    # Generate insights
    chain = prompt | llm
    response = chain.invoke({"profile_json": profile_json})
    
    # Parse response
    content = response.content.strip()
    
    # Try to extract JSON from the response
    # Sometimes LLMs wrap JSON in markdown code blocks
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0].strip()
    elif "```" in content:
        content = content.split("```")[1].split("```")[0].strip()
    
    try:
        insights_data = json.loads(content)
    except json.JSONDecodeError:
        # If parsing fails, try to extract JSON array
        import re
        json_match = re.search(r'\[.*\]', content, re.DOTALL)
        if json_match:
            insights_data = json.loads(json_match.group())
        else:
            raise ValueError(f"Failed to parse insights from LLM response: {content}")
    
    # Validate and create Insight objects
    insights = []
    for insight_data in insights_data:
        try:
            insight = Insight(**insight_data)
            insights.append(insight)
        except Exception as e:
            print(f"Warning: Failed to create insight from {insight_data}: {e}")
            continue
    
    # Ensure we have exactly 3 insights
    if len(insights) < 3:
        # Generate additional insights if needed
        while len(insights) < 3:
            insights.append(Insight(
                title="Additional Analysis Needed",
                description="Further analysis of this dataset could reveal additional patterns.",
                rationale="The dataset may contain more insights that require deeper investigation.",
                chart_code="import matplotlib.pyplot as plt\nplt.figure(figsize=(8, 6))\nplt.text(0.5, 0.5, 'Chart generation pending', ha='center')\nplt.savefig('chart.png', dpi=150, bbox_inches='tight')\nplt.close()",
                confidence=0.5
            ))
    
    return insights[:3]  # Return exactly 3


def generate_summary(profile: DatasetProfile, insights: List[Insight]) -> str:
    """
    Generate an executive summary from profile and insights.
    
    Args:
        profile: DatasetProfile object
        insights: List of Insight objects
        
    Returns:
        Executive summary string (100-150 words)
    """
    llm = create_groq_llm()
    
    # Convert to JSON
    profile_dict = profile.model_dump()
    profile_json = json.dumps(profile_dict, indent=2)
    
    # Create insights summary
    insights_summary = "\n".join([
        f"- {insight.title}: {insight.description}"
        for insight in insights
    ])
    
    # Create prompt template
    system_template = SystemMessagePromptTemplate.from_template(SYSTEM_PROMPT)
    human_template = HumanMessagePromptTemplate.from_template(SUMMARY_GENERATION_PROMPT)
    
    prompt = ChatPromptTemplate.from_messages([
        system_template,
        human_template
    ])
    
    # Generate summary
    chain = prompt | llm
    response = chain.invoke({
        "profile_json": profile_json,
        "insights_summary": insights_summary
    })
    
    return response.content.strip()

