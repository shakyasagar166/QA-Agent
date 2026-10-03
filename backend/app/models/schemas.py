from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class GherkinScenario(BaseModel):
    scenario_name: str
    scenario_type: str = "Positive"  # Positive | Negative | Boundary | Security
    steps: List[str] = Field(default_factory=list)


class ScenarioGenerationRequest(BaseModel):
    user_story: str = Field(min_length=10, description="Feature description or user story")
    framework: Optional[str] = Field(default="Playwright", description="Playwright | Cypress | Cucumber")
    provider: Optional[str] = None


class ScenarioGenerationResponse(BaseModel):
    feature_title: str
    summary: str
    target_framework: str
    gherkin_scenarios: List[GherkinScenario] = Field(default_factory=list)
    executable_test_code: str
    setup_instructions: str
    generated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ApiFuzzTestCase(BaseModel):
    id: str
    name: str
    category: str = "contract"  # contract | negative | security_fuzz | auth
    payload: Any = None
    expected_status: int = 200
    expected_assertion: str
    description: str


class ApiTestingRequest(BaseModel):
    endpoint: str = Field(min_length=1, description="Target API endpoint e.g. /api/v1/auth/login")
    method: str = Field(default="POST", description="HTTP Method")
    headers: Optional[Dict[str, str]] = None
    request_body: Optional[str] = None
    provider: Optional[str] = None


class ApiTestingResponse(BaseModel):
    api_title: str
    endpoint: str
    method: str
    test_cases: List[ApiFuzzTestCase] = Field(default_factory=list)
    python_requests_script: str
    curl_commands: List[str] = Field(default_factory=list)
    generated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class FailureDiagnosisRequest(BaseModel):
    error_log: str = Field(min_length=10, description="Test execution failure log or stack trace")
    provider: Optional[str] = None


class FailureDiagnosisResponse(BaseModel):
    failure_summary: str
    error_type: str  # AssertionFailure | ElementNotFound | NetworkTimeout | SchemaMismatch | ServerError500 | FlakyTest
    root_cause: str
    confidence_score: int = Field(ge=0, le=100)
    affected_component: str
    recommended_fix: str
    patch_code_snippet: Optional[str] = None
    prevention_tips: List[str] = Field(default_factory=list)
    analyzed_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class APIResponse(BaseModel):
    success: bool = True
    message: str = "Success"
    data: Optional[Any] = None
    error: Optional[str] = None
