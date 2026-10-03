import os
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from app.routes.e2e_scenarios import router as scenario_router
from app.routes.api_testing import router as api_test_router
from app.routes.failure_analyzer import router as failure_router

load_dotenv()

app = FastAPI(
    title="QA-Agent API",
    description="Autonomous E2E QA Agent, BDD Scenario Builder & API Security Fuzzing Studio",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
cors_origins_env = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5176,http://127.0.0.1:5176,http://localhost:3000"
)
origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scenario_router)
app.include_router(api_test_router)
app.include_router(failure_router)


@app.get("/", tags=["General"])
async def root():
    return {
        "project": "QA-Agent",
        "description": "Autonomous AI Quality Assurance & Testing Agent",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
        "endpoints": {
            "scenarios": "/api/scenarios/generate",
            "api_testing": "/api/api-testing/generate",
            "failure_diagnosis": "/api/failure/diagnose",
            "health_check": "/health"
        }
    }


@app.get("/health", tags=["General"])
async def health_check():
    provider = os.getenv("LLM_PROVIDER", "gemini")
    has_gemini = bool(os.getenv("GEMINI_API_KEY") and os.getenv("GEMINI_API_KEY") != "your_gemini_api_key_here")
    has_openai = bool(os.getenv("OPENAI_API_KEY") and os.getenv("OPENAI_API_KEY") != "your_openai_api_key_here")
    has_groq = bool(os.getenv("GROQ_API_KEY") and os.getenv("GROQ_API_KEY") != "your_groq_api_key_here")

    return {
        "status": "healthy",
        "configured_provider": provider,
        "keys_configured": {
            "gemini": has_gemini,
            "openai": has_openai,
            "groq": has_groq,
        },
        "mode": "live_llm" if (has_gemini or has_openai or has_groq) else "heuristic_fallback"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Internal server error occurred.",
            "error": str(exc),
            "path": request.url.path
        }
    )


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8003))
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
