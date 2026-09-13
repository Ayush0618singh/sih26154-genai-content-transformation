import logging

from app.core.request_context import (
    get_request_id,
)


class RequestIdFilter(
    logging.Filter
):

    def filter(
        self,
        record: logging.LogRecord,
    ) -> bool:

        record.request_id = (
            get_request_id()
        )

        return True


def configure_logging() -> None:

    root_logger = (
        logging.getLogger()
    )


    if not root_logger.handlers:

        logging.basicConfig(
            level=(
                logging.INFO
            ),

            format=(
                "%(asctime)s "
                "%(levelname)s "
                "%(name)s "
                "request_id=%(request_id)s "
                "%(message)s"
            ),
        )


    request_filter = (
        RequestIdFilter()
    )


    for handler in (
        root_logger.handlers
    ):

        handler.addFilter(
            request_filter
        )