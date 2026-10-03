from fastapi import APIRouter, HTTPException, status

from app.models.schemas import (
    APIResponse,
    FailureDiagnosisRequest,
    FailureDiagnosisResponse,
)
from app.services.failure_agent import FailureAgent

router = APIRouter(prefix="/api/failure", tags=["Test Failure & Root Cause Diagnosis"])

analyzer = FailureAgent()


SAMPLE_FAILURES = [
    {
        "id": "playwright-timeout",
        "title": "Playwright Element Timeout",
        "log": "Error: Timed out 10000ms waiting for expect(locator).toBeVisible()\nLocator: locator('button[data-testid=\"checkout-submit\"]')\nExpected: visible\nReceived: hidden\nCall log:\n  - locator.waitFor resolving to <button disabled data-testid=\"checkout-submit\">...</button>\n  - at checkout.spec.ts:48:32\n  - async testFunction (checkout.spec.ts:35:1)"
    },
    {
        "id": "jest-assertion",
        "title": "Jest / Pytest Assertion Mismatch",
        "log": "AssertionError: Expected status code 200 OK, but received 403 Forbidden\nResponse body: {\"error\": \"Token expired or invalid signature\", \"code\": \"AUTH_EXPIRED\"}\n  at test_billing_invoice.py:64 in test_download_invoice\n    assert response.status_code == 200\nE   AssertionError: assert 403 == 200"
    },
    {
        "id": "db-deadlock",
        "title": "Database Deadlock / Server Error",
        "log": "InternalServerError: 500 Internal Server Error\npsycopg2.errors.DeadlockDetected: deadlock detected\nDETAIL: Process 8291 waits for ExclusiveLock on relation 16384 of database 16385; blocked by process 8299.\nProcess 8299 waits for RowExclusiveLock on relation 16384; blocked by process 8291.\nHINT: See server log for query details.\nat /app/services/order_service.py:122 in execute_batch_checkout"
    }
]


@router.post(
    "/diagnose",
    response_model=APIResponse,
    summary="Diagnose test execution stack trace and root cause"
)
async def diagnose_failure_log(payload: FailureDiagnosisRequest):
    if len(payload.error_log.strip()) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failure log or stack trace is too short."
        )

    try:
        result: FailureDiagnosisResponse = analyzer.diagnose_failure(payload)
        return APIResponse(
            success=True,
            message="Failure diagnosis completed.",
            data=result.model_dump()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Diagnosis error: {str(exc)}"
        )


@router.get(
    "/presets",
    response_model=APIResponse,
    summary="Get preset failure traces for quick diagnosis testing"
)
async def get_presets():
    return APIResponse(
        success=True,
        message="Failure log presets loaded.",
        data=SAMPLE_FAILURES
    )

