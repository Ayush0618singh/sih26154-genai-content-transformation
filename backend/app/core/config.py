from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # =========================================================
    # Application
    # =========================================================

    app_name: str = "SIH26154 GenAI Content Transformation Platform"
    app_env: str = "development"
    app_version: str = "1.0.0"
    debug: bool = True

    api_v1_prefix: str = "/api/v1"

    frontend_url: str = "http://localhost:3000"
    allowed_origins: str = "http://localhost:3000"

    # =========================================================
    # Gemini
    # =========================================================

    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.8-flash"

    gemini_embedding_model: str = "gemini-embedding-2"
    gemini_embedding_dimensions: int = 768

    # =========================================================
    # Supabase
    # =========================================================

    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_audience: str = "authenticated"

    # =========================================================
    # Storage
    # =========================================================

    supabase_document_bucket: str = "documents"
    supabase_output_bucket: str = "generated-outputs"

    # =========================================================
    # RAG
    # =========================================================

    vector_store_provider: str = "chroma"

    chroma_persist_directory: str = "./data/chroma"

    rag_chunk_size: int = 1800
    rag_chunk_overlap: int = 250
    rag_top_k: int = 8

    # =========================================================
    # Document processing
    # =========================================================

    max_upload_size_mb: int = 50

    temp_directory: str = "./temp"
    generated_directory: str = "./generated"

    ocr_provider: str = "paddle"

    # =========================================================
    # Security
    # =========================================================

    require_auth: bool = True

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.allowed_origins.split(",")
            if origin.strip()
        ]

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    @property
    def chroma_directory_path(self) -> Path:
        path = Path(self.chroma_persist_directory)

        if path.is_absolute():
            return path

        return BACKEND_DIR / path


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()