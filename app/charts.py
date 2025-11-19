"""Chart generation and execution module."""
import os
import logging
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
from typing import Optional
from app.config import CHARTS_DIR
from app.schemas import Insight

logger = logging.getLogger(__name__)

# Allowed modules for import
ALLOWED_MODULES = {
    'matplotlib': matplotlib,
    'matplotlib.pyplot': plt,
    'pandas': pd,
    'numpy': np,
    'np': np,
    'pd': pd,
    'plt': plt,
}


def safe_import(name, globals=None, locals=None, fromlist=(), level=0):
    """Restricted import function that only allows safe modules."""
    # Handle direct imports like "import matplotlib"
    if name in ALLOWED_MODULES:
        module = ALLOWED_MODULES[name]
        # Handle fromlist for "from X import Y"
        if fromlist:
            # For "from matplotlib import pyplot", return the module
            # The actual attribute access will happen in the code
            return module
        return module
    
    # Handle submodule imports like "matplotlib.pyplot"
    if '.' in name:
        parts = name.split('.')
        base = parts[0]
        if base in ALLOWED_MODULES:
            # Try to get the submodule
            module = ALLOWED_MODULES[base]
            for part in parts[1:]:
                if hasattr(module, part):
                    module = getattr(module, part)
                else:
                    raise ImportError(f"Import of '{name}' is not allowed")
            return module
    
    raise ImportError(f"Import of '{name}' is not allowed")


def ensure_charts_directory():
    """Ensure the charts directory exists."""
    os.makedirs(CHARTS_DIR, exist_ok=True)


def execute_chart_code(chart_code: str, csv_path: str, output_path: str) -> bool:
    """
    Execute matplotlib code in a sandboxed environment.
    
    Args:
        chart_code: Python code string to execute
        csv_path: Path to the CSV file for data loading
        output_path: Path where the chart should be saved
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Create a restricted global namespace
        safe_globals = {
            '__builtins__': {
                'print': print,
                'len': len,
                'range': range,
                'str': str,
                'int': int,
                'float': float,
                'list': list,
                'dict': dict,
                'tuple': tuple,
                'max': max,
                'min': min,
                'sum': sum,
                'abs': abs,
                'round': round,
                '__import__': safe_import,  # Restricted import function
            },
            'pd': pd,
            'pandas': pd,
            'plt': plt,  # matplotlib.pyplot
            'matplotlib': matplotlib,
            'numpy': np,
            'np': np,
        }
        
        # Load the CSV data
        try:
            df = pd.read_csv(csv_path, encoding='utf-8')
        except UnicodeDecodeError:
            df = pd.read_csv(csv_path, encoding='latin-1')
        
        safe_globals['df'] = df
        safe_globals['data'] = df
        
        # Execute the chart code
        exec(chart_code, safe_globals)
        
        # Verify the file was created
        if not os.path.exists(output_path):
            logger.warning(f"Chart code executed but file not created: {output_path}")
            return False
        
        return True
    except Exception as e:
        logger.error(f"Error executing chart code: {e}", exc_info=True)
        return False


def generate_chart(insight: Insight, csv_path: str, index: int) -> Optional[str]:
    """
    Generate a chart for an insight.
    
    Args:
        insight: Insight object with chart_code
        csv_path: Path to the CSV file
        index: Index of the insight (for filename)
        
    Returns:
        Path to the generated chart file, or None if failed
    """
    ensure_charts_directory()
    
    output_path = os.path.join(CHARTS_DIR, f"insight_{index}.png")
    
    # Modify chart code to use the correct output path
    chart_code = insight.chart_code
    
    # Normalize and fix import statements first
    # Remove problematic imports since we already provide plt, pd, np in globals
    import re
    # Remove all import statements - we'll provide everything needed
    chart_code = re.sub(r'^import\s+.*?$', '', chart_code, flags=re.MULTILINE)
    chart_code = re.sub(r'^from\s+.*?import\s+.*?$', '', chart_code, flags=re.MULTILINE)
    # Clean up multiple blank lines
    chart_code = re.sub(r'\n\s*\n\s*\n', '\n\n', chart_code)
    chart_code = chart_code.strip()
    
    # Replace file reading operations with df variable (which is already loaded)
    # Replace pd.read_csv(...) with df
    chart_code = re.sub(r'pd\.read_csv\([^)]+\)', 'df', chart_code)
    chart_code = re.sub(r'pandas\.read_csv\([^)]+\)', 'df', chart_code)
    # Replace pd.read_json(...) with df
    chart_code = re.sub(r'pd\.read_json\([^)]+\)', 'df', chart_code)
    chart_code = re.sub(r'pandas\.read_json\([^)]+\)', 'df', chart_code)
    # Replace any df = pd.read_* assignments
    chart_code = re.sub(r'df\s*=\s*pd\.read_\w+\([^)]+\)', '', chart_code)
    chart_code = re.sub(r'df\s*=\s*pandas\.read_\w+\([^)]+\)', '', chart_code)
    # Replace data = pd.read_* with just removing the line (data is also available as df)
    chart_code = re.sub(r'data\s*=\s*pd\.read_\w+\([^)]+\)', '', chart_code)
    chart_code = re.sub(r'data\s*=\s*pandas\.read_\w+\([^)]+\)', '', chart_code)
    # Clean up any resulting blank lines
    chart_code = re.sub(r'\n\s*\n\s*\n', '\n\n', chart_code)
    chart_code = chart_code.strip()
    
    # Now modify savefig path
    if 'plt.savefig' in chart_code:
        # Replace any existing savefig path with our output path
        chart_code = re.sub(
            r"plt\.savefig\(['\"].*?['\"]",
            f"plt.savefig('{output_path}'",
            chart_code
        )
    else:
        # Add savefig if not present
        chart_code += f"\nplt.savefig('{output_path}', dpi=150, bbox_inches='tight')"
    
    # Ensure plt.close() is called
    if 'plt.close()' not in chart_code:
        chart_code += "\nplt.close()"
    
    # Execute the chart code
    success = execute_chart_code(chart_code, csv_path, output_path)
    
    if success and os.path.exists(output_path):
        logger.info(f"Chart generated successfully: {output_path}")
        return output_path
    else:
        logger.warning(f"Chart generation failed for insight {index}")
        return None

