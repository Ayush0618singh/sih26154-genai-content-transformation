from contextlib import (
    asynccontextmanager,
)

from pathlib import (
    Path,
)

from fastapi import (
    FastAPI,
    HTTPException,
)

from fastapi.exceptions import (
    RequestValidationError,
)

from fastapi.middleware.cors import (
    CORSMiddleware,
)

from fastapi.responses import (
    ORJSONResponse,
)

from app.api.v1.router import (
    api_router,
)

from app.core.config import (
    settings,
)

from app.core.exception_handlers import (
    http_exception_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)

from app.core.logging_config import (
    configure_logging,
)

from app.middleware.rate_limit import (
    DatabaseRateLimitMiddleware,
)

from app.middleware.request_context import (
    RequestContextMiddleware,
)


configure_logging()


def _allowed_origins() -> list[
    str
]:

    value = (
        settings.allowed_origins
    )


    if isinstance(
        value,
        str,
    ):

        return [
            origin.strip()

            for origin
            in value.split(
                ","
            )

            if origin.strip()
        ]


    return [
        str(
            origin
        ).strip()

        for origin
        in value

        if str(
            origin
        ).strip()
    ]


@asynccontextmanager
async def lifespan(
    app: FastAPI,
):

    del app


    Path(
        settings.temp_directory
    ).mkdir(
        parents=True,
        exist_ok=True,
    )


    Path(
        settings.generated_directory
    ).mkdir(
        parents=True,
        exist_ok=True,
    )


    yield


app = FastAPI(
    title=(
        settings.app_name
    ),

    version=(
        settings.app_version
    ),

    debug=(
        settings.debug
    ),

    lifespan=(
        lifespan
    ),

    default_response_class=(
        ORJSONResponse
    ),
)


# ============================================================
# Middleware ordering
#
# FastAPI / Starlette wraps the most recently-added
# middleware around earlier middleware.
#
# CORS is therefore added last so even 429/500 responses
# receive correct CORS handling.
# ============================================================


app.add_middleware(
    DatabaseRateLimitMiddleware
)


app.add_middleware(
    RequestContextMiddleware
)


app.add_middleware(
    CORSMiddleware,

    allow_origins=(
        _allowed_origins()
    ),

    allow_credentials=True,

    allow_methods=[
        "*",
    ],

    allow_headers=[
        "*",
    ],

    expose_headers=[
        "X-Request-ID",
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
    ],
)


app.add_exception_handler(
    HTTPException,
    http_exception_handler,
)


app.add_exception_handler(
    RequestValidationError,
    validation_exception_handler,
)


app.add_exception_handler(
    Exception,
    unhandled_exception_handler,
)


app.include_router(
    api_router,
    prefix=(
        settings.api_v1_prefix
    ),
)