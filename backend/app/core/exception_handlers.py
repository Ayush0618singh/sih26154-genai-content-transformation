from __future__ import annotations

import logging

from fastapi import (
    HTTPException,
    Request,
)

from fastapi.exceptions import (
    RequestValidationError,
)

from fastapi.responses import (
    ORJSONResponse,
)

from app.core.request_context import (
    get_request_id,
)


logger = logging.getLogger(
    "app.errors"
)


async def http_exception_handler(
    request: Request,
    exc: HTTPException,
):

    request_id = (
        getattr(
            request.state,
            "request_id",
            None,
        )
        or get_request_id()
    )


    return ORJSONResponse(
        status_code=(
            exc.status_code
        ),

        headers=(
            exc.headers
            or {}
        ),

        content={
            "detail":
                exc.detail,

            "request_id":
                request_id,
        },
    )


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):

    request_id = (
        getattr(
            request.state,
            "request_id",
            None,
        )
        or get_request_id()
    )


    return ORJSONResponse(
        status_code=422,

        content={
            "detail":
                "Request validation failed.",

            "errors":
                exc.errors(),

            "request_id":
                request_id,
        },
    )


async def unhandled_exception_handler(
    request: Request,
    exc: Exception,
):

    request_id = (
        getattr(
            request.state,
            "request_id",
            None,
        )
        or get_request_id()
    )


    logger.exception(
        (
            "unhandled_exception "
            "method=%s "
            "path=%s "
            "request_id=%s"
        ),
        request.method,
        request.url.path,
        request_id,
        exc_info=exc,
    )


    return ORJSONResponse(
        status_code=500,

        content={
            "detail":
                "Internal server error.",

            "request_id":
                request_id,
        },
    )