"""Routes package exports."""
from app.routes.e2e_scenarios import router as scenario_router
from app.routes.api_testing import router as api_test_router
from app.routes.failure_analyzer import router as failure_router

__all__ = ["scenario_router", "api_test_router", "failure_router"]
