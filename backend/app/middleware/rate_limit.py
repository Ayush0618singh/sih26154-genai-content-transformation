from __future__ import annotations

import asyncio
import hashlib
import logging

from dataclasses import (
    dataclass,
)

from fastapi import (
    Request,
)

from fastapi.responses import (
    ORJSONResponse,
)

from starlette.middleware.base import (
    BaseHTTPMiddleware,
)

from app.core.rate_limit_config import (
    rate_limit_config,
)

from app.core.supabase import (
    get_supabase_admin_client,
)


logger = logging.getLogger(
    __name__
)


@dataclass(
    frozen=True
)
class RateLimitRule:
    bucket: str

    limit: int

    window_seconds: int


EXCLUDED_PATHS = {
    "/api/v1/health",
    "/api/v1/ready",
    "/docs",
    "/redoc",
    "/openapi.json",
}


HEAVY_ENDPOINT_PREFIXES = (
    "/api/v1/documents/upload",
    "/api/v1/transformations",
    "/api/v1/rag/index",
    "/api/v1/exports",
)


def classify_rate_limit(
    *,
    method: str,
    path: str,
) -> RateLimitRule:

    is_heavy = (
        method.upper()
        in {
            "POST",
            "PUT",
            "PATCH",
        }

        and any(
            path.startswith(
                prefix
            )
            for prefix
            in HEAVY_ENDPOINT_PREFIXES
        )
    )


    if is_heavy:

        return (
            RateLimitRule(
                bucket=(
                    "heavy"
                ),

                limit=(
                    rate_limit_config
                    .heavy_requests
                ),

                window_seconds=(
                    rate_limit_config
                    .window_seconds
                ),
            )
        )


    return (
        RateLimitRule(
            bucket=(
                "default"
            ),

            limit=(
                rate_limit_config
                .default_requests
            ),

            window_seconds=(
                rate_limit_config
                .window_seconds
            ),
        )
    )


def _client_ip(
    request: Request,
) -> str:

    if (
        rate_limit_config
        .trust_proxy_headers
    ):

        forwarded = (
            request.headers.get(
                "x-forwarded-for"
            )
        )


        if forwarded:

            return (
                forwarded
                .split(
                    ","
                )[0]
                .strip()
            )


    if request.client:

        return (
            request.client.host
        )


    return "unknown"


def _key_hash(
    *,
    ip: str,
    bucket: str,
) -> str:

    raw = (
        f"{ip}:{bucket}"
    )


    return (
        hashlib.sha256(
            raw.encode(
                "utf-8"
            )
        )
        .hexdigest()
    )


def _consume_sync(
    *,
    key_hash: str,
    rule: RateLimitRule,
) -> dict:

    admin = (
        get_supabase_admin_client()
    )


    response = (
        admin.rpc(
            "consume_rate_limit",

            {
                "p_key_hash":
                    key_hash,

                "p_limit":
                    rule.limit,

                "p_window_seconds":
                    rule.window_seconds,
            },
        )
        .execute()
    )


    rows = (
        response.data
        or []
    )


    if not rows:

        raise RuntimeError(
            "Rate limit RPC "
            "returned no result."
        )


    return rows[
        0
    ]


class DatabaseRateLimitMiddleware(
    BaseHTTPMiddleware
):

    async def dispatch(
        self,
        request: Request,
        call_next,
    ):

        if (
            not rate_limit_config.enabled

            or request.url.path
            in EXCLUDED_PATHS

            or request.method.upper()
            == "OPTIONS"
        ):

            return await call_next(
                request
            )


        rule = (
            classify_rate_limit(
                method=(
                    request.method
                ),

                path=(
                    request.url.path
                ),
            )
        )


        client_ip = (
            _client_ip(
                request
            )
        )


        hashed_key = (
            _key_hash(
                ip=(
                    client_ip
                ),

                bucket=(
                    rule.bucket
                ),
            )
        )


        try:

            decision = (
                await asyncio.to_thread(
                    _consume_sync,

                    key_hash=(
                        hashed_key
                    ),

                    rule=(
                        rule
                    ),
                )
            )


        except Exception as exc:

            logger.exception(
                "rate_limit_backend_failed",
                exc_info=(
                    exc
                ),
            )


            if (
                rate_limit_config
                .fail_open
            ):

                return await call_next(
                    request
                )


            return (
                ORJSONResponse(
                    status_code=503,

                    content={
                        "detail":
                            (
                                "Rate limit service "
                                "is temporarily "
                                "unavailable."
                            ),

                        "request_id":
                            getattr(
                                request.state,
                                "request_id",
                                None,
                            ),
                    },
                )
            )


        allowed = bool(
            decision.get(
                "allowed",
                False,
            )
        )


        remaining = int(
            decision.get(
                "remaining",
                0,
            )
        )


        reset_at = str(
            decision.get(
                "reset_at",
                "",
            )
        )


        headers = {
            "X-RateLimit-Limit":
                str(
                    rule.limit
                ),

            "X-RateLimit-Remaining":
                str(
                    remaining
                ),

            "X-RateLimit-Reset":
                reset_at,
        }


        if not allowed:

            headers[
                "Retry-After"
            ] = str(
                rule.window_seconds
            )


            return (
                ORJSONResponse(
                    status_code=429,

                    headers=(
                        headers
                    ),

                    content={
                        "detail":
                            (
                                "Too many requests. "
                                "Please retry later."
                            ),

                        "request_id":
                            getattr(
                                request.state,
                                "request_id",
                                None,
                            ),
                    },
                )
            )


        response = (
            await call_next(
                request
            )
        )


        for (
            key,
            value,
        ) in headers.items():

            response.headers[
                key
            ] = value


        return response