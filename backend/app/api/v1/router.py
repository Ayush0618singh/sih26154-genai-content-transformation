from fastapi import APIRouter

from app.api.v1.dashboard import (
    router as dashboard_router,
)
from app.api.v1.documents import (
    router as documents_router,
)
from app.api.v1.exports import (
    router as exports_router,
)
from app.api.v1.health import (
    router as health_router,
)
from app.api.v1.profile import (
    router as profile_router,
)
from app.api.v1.rag import (
    router as rag_router,
)
from app.api.v1.transformations import (
    router as transformations_router,
)


api_router = APIRouter()


api_router.include_router(
    health_router
)

api_router.include_router(
    profile_router
)

api_router.include_router(
    documents_router
)

api_router.include_router(
    rag_router
)

api_router.include_router(
    transformations_router
)

api_router.include_router(
    exports_router
)

api_router.include_router(
    dashboard_router
)