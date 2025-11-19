"""FastAPI application and endpoints."""
import os
import tempfile
import base64
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import MAX_FILE_SIZE_MB, CHARTS_DIR
from app.profiler import profile_dataset
from app.agent import generate_insights, generate_summary
from app.charts import generate_chart
from app.formatter import generate_reports
from app.schemas import Report, Insight

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


app = FastAPI(title="CSV Insight Copilot API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.post("/analyze")
async def analyze_csv(file: UploadFile = File(...)):
    """
    Analyze a CSV file and generate insights, charts, and reports.
    
    Args:
        file: Uploaded CSV file
        
    Returns:
        Report JSON with insights, charts, and reports
    """
    try:
        # Validate file type
        if not file.filename or not file.filename.endswith('.csv'):
            logger.error(f"Invalid file type: {file.filename}")
            raise HTTPException(status_code=400, detail="File must be a CSV file")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as tmp_file:
            content = await file.read()
            
            # Validate file is not empty
            if len(content) == 0:
                logger.error("Empty file uploaded")
                raise HTTPException(status_code=400, detail="File is empty")
            
            # Validate file size (2MB limit)
            file_size_mb = len(content) / (1024 * 1024)
            logger.info(f"File uploaded: {file.filename}, size: {file_size_mb:.2f}MB")
            if file_size_mb > MAX_FILE_SIZE_MB:
                logger.error(f"File size exceeds limit: {file_size_mb:.2f}MB > {MAX_FILE_SIZE_MB}MB")
                raise HTTPException(
                    status_code=400,
                    detail=f"File size ({file_size_mb:.2f}MB) exceeds maximum allowed size ({MAX_FILE_SIZE_MB}MB)"
                )
            
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        try:
            # Step 1: Profile the dataset
            profile = profile_dataset(tmp_file_path)
            
            # Step 2: Generate insights
            insights = generate_insights(profile)
            
            # Step 3: Generate charts
            chart_paths = []
            chart_base64 = []
            for i, insight in enumerate(insights):
                try:
                    chart_path = generate_chart(insight, tmp_file_path, i)
                    if chart_path and os.path.exists(chart_path):
                        chart_paths.append(chart_path)
                        # Read chart and convert to base64
                        with open(chart_path, 'rb') as f:
                            chart_data = base64.b64encode(f.read()).decode('utf-8')
                            chart_base64.append(f"data:image/png;base64,{chart_data}")
                    else:
                        logger.warning(f"Chart generation failed for insight {i}, using None")
                        chart_paths.append(None)
                        chart_base64.append(None)
                except Exception as e:
                    logger.error(f"Error generating chart for insight {i}: {e}", exc_info=True)
                    chart_paths.append(None)
                    chart_base64.append(None)
            
            # Update insights with chart paths
            for i, insight in enumerate(insights):
                if i < len(chart_paths) and chart_paths[i]:
                    insight.chart_path = chart_paths[i]
            
            # Step 4: Generate executive summary
            summary = generate_summary(profile, insights)
            
            # Step 5: Generate reports
            md_report, html_report = generate_reports(profile, insights, summary, chart_paths)
            
            # Step 6: Create dataset overview text
            dataset_overview = f"Dataset contains {profile.n_rows:,} rows and {profile.n_cols} columns. "
            missing_total = sum(profile.null_counts.values())
            missing_pct = (missing_total / (profile.n_rows * profile.n_cols) * 100) if profile.n_rows * profile.n_cols > 0 else 0
            dataset_overview += f"Missing values: {missing_total:,} ({missing_pct:.2f}%). "
            dataset_overview += f"Columns: {', '.join(profile.columns[:5])}"
            if len(profile.columns) > 5:
                dataset_overview += f" and {len(profile.columns) - 5} more."
            
            # Create report object
            report = Report(
                dataset_overview=dataset_overview,
                insights=insights,
                summary=summary,
                charts=chart_base64,
                markdown_report=md_report,
                html_report=html_report
            )
            
            # Return response with profile data for frontend
            response_data = report.model_dump()
            response_data['profile'] = {
                'n_rows': profile.n_rows,
                'n_cols': profile.n_cols,
                'columns': profile.columns,
                'dtypes': profile.dtypes,
                'null_counts': profile.null_counts,
                'unique_counts': profile.unique_counts,
            }
            
            return JSONResponse(content=response_data)
            
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)
                
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"ValueError in analyze_csv: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in analyze_csv: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

