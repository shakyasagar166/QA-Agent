import os
import json
import logging
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


def clean_json_response(raw_text: str) -> str:
    cleaned = raw_text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[len("```json"):].strip()
    elif cleaned.startswith("```"):
        cleaned = cleaned[len("```"):].strip()
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3].strip()
    return cleaned


class LLMService:
    """Multi-provider LLM interface for QA-Agent."""

    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "gemini").lower()
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        self.groq_key = os.getenv("GROQ_API_KEY")
        self.groq_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.openai_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    def _call_gemini(self, prompt: str) -> str:
        if not self.gemini_key or self.gemini_key == "your_gemini_api_key_here":
            raise ValueError("GEMINI_API_KEY not configured.")
        from google import genai
        client = genai.Client(api_key=self.gemini_key)
        response = client.models.generate_content(
            model=self.gemini_model,
            contents=prompt,
        )
        return response.text

    def _call_groq(self, prompt: str) -> str:
        if not self.groq_key or self.groq_key == "your_groq_api_key_here":
            raise ValueError("GROQ_API_KEY not configured.")
        from groq import Groq
        client = Groq(api_key=self.groq_key)
        completion = client.chat.completions.create(
            model=self.groq_model,
            messages=[
                {"role": "system", "content": "You are a Lead QA Automation & E2E Testing Architect. Return valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        return completion.choices[0].message.content

    def _call_openai(self, prompt: str) -> str:
        if not self.openai_key or self.openai_key == "your_openai_api_key_here":
            raise ValueError("OPENAI_API_KEY not configured.")
        import openai
        client = openai.OpenAI(api_key=self.openai_key)
        completion = client.chat.completions.create(
            model=self.openai_model,
            messages=[
                {"role": "system", "content": "You are a Lead QA Automation & E2E Testing Architect. Return valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        return completion.choices[0].message.content

    def generate_json(self, prompt: str, provider_override: Optional[str] = None) -> Optional[Dict[str, Any]]:
        target_provider = (provider_override or self.provider or "gemini").lower()
        raw_output = None

        if target_provider == "gemini" and self.gemini_key and self.gemini_key != "your_gemini_api_key_here":
            try:
                raw_output = self._call_gemini(prompt)
            except Exception as e:
                logger.warning(f"Gemini call failed: {e}")

        elif target_provider == "groq" and self.groq_key and self.groq_key != "your_groq_api_key_here":
            try:
                raw_output = self._call_groq(prompt)
            except Exception as e:
                logger.warning(f"Groq call failed: {e}")

        elif target_provider == "openai" and self.openai_key and self.openai_key != "your_openai_api_key_here":
            try:
                raw_output = self._call_openai(prompt)
            except Exception as e:
                logger.warning(f"OpenAI call failed: {e}")

        if not raw_output:
            return None

        try:
            cleaned = clean_json_response(raw_output)
            return json.loads(cleaned)
        except Exception as parse_err:
            logger.error(f"JSON parsing error: {parse_err}")
            return None
