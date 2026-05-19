"""AI triage and summarization endpoints."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..config import get_settings

router = APIRouter(tags=["ai"])


class SummarizeRequest(BaseModel):
    subject: str
    description: str


class SummarizeResponse(BaseModel):
    summary: str
    suggested_priority: int
    category: str
    confidence: float


@router.post("/summarize-ticket", response_model=SummarizeResponse)
async def summarize_ticket(request: SummarizeRequest) -> SummarizeResponse:
    """
    Synchronous LLM call for real-time ticket triage from helpdesk frontend.
    Called on first open of a ticket that hasn't been triaged yet.
    """
    settings = get_settings()

    try:
        from openai import AsyncOpenAI  # type: ignore[import]
        import json

        client = AsyncOpenAI(api_key=settings.openai_api_key)

        prompt = (
            f"Given this helpdesk ticket:\n"
            f"Subject: {request.subject}\n"
            f"Description: {request.description}\n\n"
            f"Respond in JSON only with these fields:\n"
            f"- suggested_priority: integer 1-4 (1=CRITICAL, 2=HIGH, 3=MEDIUM, 4=LOW)\n"
            f"- category: one of bug, feature, infra, security, unknown\n"
            f"- confidence: float 0.0-1.0\n"
            f"- summary: one-line summary string\n"
        )

        response = await client.chat.completions.create(
            model=settings.openai_model,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.2,
        )

        content = response.choices[0].message.content or "{}"
        data = json.loads(content)

        return SummarizeResponse(
            summary=data.get("summary", "Unable to generate summary"),
            suggested_priority=int(data.get("suggested_priority", 3)),
            category=data.get("category", "unknown"),
            confidence=float(data.get("confidence", 0.0)),
        )

    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {str(e)}") from e
