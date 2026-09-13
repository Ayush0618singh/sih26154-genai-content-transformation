from functools import lru_cache

from supabase import Client, create_client

from app.core.config import settings


def _ensure_supabase_configuration() -> None:
    missing: list[str] = []

    if not settings.supabase_url:
        missing.append("SUPABASE_URL")

    if not settings.supabase_anon_key:
        missing.append("SUPABASE_ANON_KEY")

    if not settings.supabase_service_role_key:
        missing.append("SUPABASE_SERVICE_ROLE_KEY")

    if missing:
        raise RuntimeError(
            "Missing Supabase configuration: "
            + ", ".join(missing)
        )


@lru_cache
def get_supabase_public_client() -> Client:
    _ensure_supabase_configuration()

    return create_client(
        settings.supabase_url,
        settings.supabase_anon_key,
    )


@lru_cache
def get_supabase_admin_client() -> Client:
    _ensure_supabase_configuration()

    return create_client(
        settings.supabase_url,
        settings.supabase_service_role_key,
    )