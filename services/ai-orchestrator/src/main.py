"""NexFlow AI Orchestrator — FastAPI entrypoint."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routers import health, ai


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Startup / shutdown lifecycle."""
    settings = get_settings()
    print(f"🚀 AI Orchestrator starting — Redis: {settings.redis_url}")
    yield
    print("👋 AI Orchestrator shutting down")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="NexFlow AI Orchestrator",
        version="0.0.1",
        description="Async LLM triage and summarization service",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.cors_origin],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(ai.router, prefix="/ai")

    return app


app = create_app()
