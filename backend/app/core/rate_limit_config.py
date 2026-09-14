from __future__ import annotations

import os

from dataclasses import dataclass


def _bool_env(
    name: str,
    default: bool,
) -> bool:

    value = os.getenv(name)

    if value is None:
        return default

    return value.strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }


def _positive_int(
    name: str,
    default: int,
) -> int:

    value = os.getenv(name)

    if not value:
        return default

    try:
        parsed = int(value)

    except ValueError:
        return default

    return parsed if parsed > 0 else default


@dataclass(frozen=True)
class RateLimitConfig:
    enabled: bool
    default_requests: int
    heavy_requests: int
    window_seconds: int
    fail_open: bool
    trust_proxy_headers: bool


rate_limit_config = RateLimitConfig(
    enabled=_bool_env(
        "RATE_LIMIT_ENABLED",
        True,
    ),

    default_requests=_positive_int(
        "RATE_LIMIT_REQUESTS",
        120,
    ),

    heavy_requests=_positive_int(
        "RATE_LIMIT_HEAVY_REQUESTS",
        20,
    ),

    window_seconds=_positive_int(
        "RATE_LIMIT_WINDOW_SECONDS",
        60,
    ),

    fail_open=_bool_env(
        "RATE_LIMIT_FAIL_OPEN",
        True,
    ),

    trust_proxy_headers=_bool_env(
        "TRUST_PROXY_HEADERS",
        False,
    ),
)