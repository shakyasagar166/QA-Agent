from fastapi import APIRouter, HTTPException, status

from app.models.schemas import (
    APIResponse,
    ScenarioGenerationRequest,
    ScenarioGenerationResponse,
)
from app.services.scenario_agent import ScenarioAgent

router = APIRouter(prefix="/api/scenarios", tags=["BDD & E2E Scenarios"])

agent = ScenarioAgent()

SAMPLE_STORIES = [
    {
        "id": "user-login",
        "title": "OAuth & Multi-Factor Login Flow",
        "story": "As an enterprise user, when I navigate to /login and enter my email and password, if MFA is enabled, I should be redirected to /verify-otp with an SMS code. Upon entering valid 6-digit OTP, I should land on /dashboard with active JWT session."
    },
    {
        "id": "e2e-checkout",
        "title": "E-Commerce Cart, Coupon & Stripe Checkout",
        "story": "As an authenticated shopper, when I add items to my cart and apply a 20% discount coupon code 'SUMMER20', the cart total should update automatically. When I proceed to payment with a valid credit card, the order should complete, redirect to confirmation page with an order ID, and trigger an email confirmation."
    },
    {
        "id": "password-reset",
        "title": "Password Reset & Secure Token Lifecycle",
        "story": "As a forgotten user, when I request password reset on /forgot-password, an encrypted one-time token link should be sent. When I open the link within 15 minutes, I can set a new password complying with complexity rules. Reusing old token should show expired error."
    }
]


@router.post(
    "/generate",
    response_model=APIResponse,
    summary="Generate BDD Gherkin scenarios & Playwright/Cypress E2E test code"
)
async def generate_scenarios(payload: ScenarioGenerationRequest):
    if len(payload.user_story.strip()) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User story or requirement is too short."
        )

    try:
        result: ScenarioGenerationResponse = agent.generate_scenarios(payload)
        return APIResponse(
            success=True,
            message="BDD scenarios and automation code generated successfully.",
            data=result.model_dump()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scenario generation error: {str(exc)}"
        )


@router.get(
    "/presets",
    response_model=APIResponse,
    summary="Get sample user story presets"
)
async def get_presets():
    return APIResponse(
        success=True,
        message="Preset stories loaded.",
        data=SAMPLE_STORIES
    )
