from __future__ import annotations

import logging
import re

from time import (
    perf_counter,
)

from uuid import (
    uuid4,
)

from fastapi import (
    Request,
)

from starlette.middleware.base import (
    BaseHTTPMiddleware,
)

from app.core.request_context import (
    reset_request_id,
    set_request_id,
)


logger = logging.getLogger(
    "app.request"
)


REQUEST_ID_PATTERN = (
    re.compile(
        r"^[A-Za-z0-9._-]{8,128}$"
    )
)


class RequestContextMiddleware(
    BaseHTTPMiddleware
):

    async def dispatch(
        self,
        request: Request,
        call_next,
    ):

        incoming_request_id = (
            request.headers.get(
                "X-Request-ID"
            )
        )


        if (
            incoming_request_id
            and REQUEST_ID_PATTERN.fullmatch(
                incoming_request_id
            )
        ):

            request_id = (
                incoming_request_id
            )

        else:

            request_id = (
                uuid4().hex
            )


        token = (
            set_request_id(
                request_id
            )
        )


        request.state.request_id = (
            request_id
        )


        started_at = (
            perf_counter()
        )


        try:

            response = await call_next(
                request
            )


            elapsed_ms = (
                (
                    perf_counter()
                    - started_at
                )
                * 1000
            )


            response.headers[
                "X-Request-ID"
            ] = request_id


            logger.info(
                (
                    "request_completed "
                    "method=%s "
                    "path=%s "
                    "status=%s "
                    "duration_ms=%.2f "
                    "request_id=%s"
                ),
                request.method,
                request.url.path,
                response.status_code,
                elapsed_ms,
                request_id,
            )


            return response


        finally:

            reset_request_id(
                token
            )