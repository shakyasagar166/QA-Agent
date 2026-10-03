from fastapi import APIRouter, HTTPException, status

from app.models.schemas import (
    APIResponse,
    ApiTestingRequest,
    ApiTestingResponse,
)
from app.services.api_tester import ApiTester

router = APIRouter(prefix="/api/api-testing", tags=["API Contract & Fuzz Testing"])

tester = ApiTester()

SAMPLE_APIS = [
    {
        "id": "auth-login",
        "title": "Auth Login Endpoint",
        "method": "POST",
        "endpoint": "/api/v1/auth/login",
        "body": "{\n  \"email\": \"admin@company.com\",\n  \"password\": \"SecurePass123!\"\n}"
    },
    {
        "id": "create-order",
        "title": "Checkout Order Creation",
        "method": "POST",
        "endpoint": "/api/v1/orders",
        "body": "{\n  \"customer_id\": 42,\n  \"items\": [\n    {\"product_id\": 10, \"quantity\": 2}\n  ],\n  \"currency\": \"USD\"\n}"
    }
]


@router.post(
    "/generate",
    response_model=APIResponse,
    summary="Generate API contract, boundary, and security fuzz tests"
)
async def generate_api_test_suite(payload: ApiTestingRequest):
    if not payload.endpoint.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Endpoint path is required."
        )

    try:
        result: ApiTestingResponse = tester.generate_api_tests(payload)
        return APIResponse(
            success=True,
            message="API test cases and fuzz payloads generated.",
            data=result.model_dump()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"API testing error: {str(exc)}"
        )


@router.get(
    "/presets",
    response_model=APIResponse,
    summary="Get preset API samples"
)
async def get_presets():
    return APIResponse(
        success=True,
        message="API presets retrieved.",
        data=SAMPLE_APIS
    )
