"""Application settings loaded from environment variables."""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Redis
    redis_url: str = "redis://localhost:6379"
    redis_triage_stream: str = "events:triage"
    redis_updates_stream: str = "events:updates"
    redis_consumer_group: str = "ai-orchestrator"

    # OpenAI
    openai_api_key: str = "sk-placeholder"
    openai_model: str = "gpt-4o-mini"

    # Service
    cors_origin: str = "http://localhost:3000"
    port: int = 8000

    # Work Item Service (for cross-service patch calls)
    work_item_service_url: str = "http://localhost:3002"


@lru_cache
def get_settings() -> Settings:
    return Settings()
