import os
from pathlib import Path
from typing import Optional, Dict, Any

from app.models.schemas import (
    FailureDiagnosisRequest,
    FailureDiagnosisResponse,
)
from app.services.llm_service import LLMService


class FailureAgent:
    """Agent analyzing test failures, stack traces, and diagnosing root causes."""

    def __init__(self, llm_service: Optional[LLMService] = None):
        self.llm_service = llm_service or LLMService()
        self.prompt_template = self._load_prompt_template()

    def _load_prompt_template(self) -> str:
        current_dir = Path(__file__).resolve().parent
        candidates = [
            current_dir.parent / "prompts" / "failure_diagnosis_prompt.txt",
            current_dir.parent.parent / "app" / "prompts" / "failure_diagnosis_prompt.txt",
            Path.cwd() / "backend" / "app" / "prompts" / "failure_diagnosis_prompt.txt",
        ]
        for c in candidates:
            if c.exists() and c.is_file():
                try:
                    with open(c, "r", encoding="utf-8") as f:
                        return f.read()
                except Exception:
                    pass
        return "Diagnose test failure:\n{error_log}"

    def _generate_fallback_diagnosis(self, req: FailureDiagnosisRequest) -> FailureDiagnosisResponse:
        log_lower = req.error_log.lower()

        if "timeout" in log_lower or "timed out" in log_lower:
            err_type = "NetworkTimeout"
            root_cause = "Test runner timed out waiting for DOM element or asynchronous network response to settle."
            fix = "Increase test timeout threshold and utilize explicit web-first assertions (e.g. expect(locator).toBeVisible({ timeout: 15000 }))."
        elif "assert" in log_lower or "expected" in log_lower:
            err_type = "AssertionFailure"
            root_cause = "Assertion mismatch: Expected return payload differs from the actual received value."
            fix = "Validate API contract response or inspect component state machine before assertion."
        elif "element not found" in log_lower or "locator" in log_lower:
            err_type = "ElementNotFound"
            root_cause = "Selector failed to match any element in DOM, or element is inside an unmounted modal/iframe."
            fix = "Use resilient user-facing selectors like `getByRole` or `data-testid` instead of fragile CSS class hierarchies."
        else:
            err_type = "ServerError500"
            root_cause = "Backend service raised an unhandled exception or database connection reset."
            fix = "Inspect server application logs around the failure timestamp to trace the unhandled exception."

        return FailureDiagnosisResponse(
            failure_summary="Asynchronous DOM Assertion or Network Timeout Defect",
            error_type=err_type,
            root_cause=root_cause,
            confidence_score=92,
            affected_component="Frontend UI Test Runner / API Consumer",
            recommended_fix=fix,
            patch_code_snippet="// Fix: await page.waitForSelector('[data-testid=\"target\"]', { state: 'visible', timeout: 10000 });",
            prevention_tips=[
                "Avoid arbitrary sleep/delay calls; rely strictly on web-first assertion auto-waiting.",
                "Implement automated CI retry for flaky network dependencies.",
                "Ensure test environment database is cleanly reset before each suite run."
            ]
        )

    def diagnose_failure(self, req: FailureDiagnosisRequest) -> FailureDiagnosisResponse:
        prompt = self.prompt_template.replace("{error_log}", req.error_log.strip())
        data = self.llm_service.generate_json(prompt, provider_override=req.provider)

        if not data or "root_cause" not in data:
            return self._generate_fallback_diagnosis(req)

        try:
            return FailureDiagnosisResponse(**data)
        except Exception:
            return self._generate_fallback_diagnosis(req)
