from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from app.core.security import (
    get_current_user,
)
from app.schemas.auth import (
    AuthenticatedUser,
)
from app.schemas.rag import (
    RAGIndexResponse,
    RAGQueryRequest,
    RAGQueryResponse,
)
from app.services.rag.rag_service import (
    rag_service,
)


router = APIRouter(
    prefix="/rag",
    tags=["RAG"],
)


@router.post(
    "/index/{document_id}",
    response_model=RAGIndexResponse,
)
async def index_document(
    document_id: UUID,

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
) -> RAGIndexResponse:
    try:
        (
            collection_name,
            chunk_count,
        ) = await rag_service.ensure_index(
            document_id=document_id,
            user_id=current_user.id,
            force=True,
        )

        return RAGIndexResponse(
            document_id=document_id,
            collection_name=(
                collection_name
            ),
            chunk_count=chunk_count,
            status="ready",
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "RAG indexing failed: "
                f"{exc}"
            ),
        ) from exc


@router.post(
    "/query",
    response_model=RAGQueryResponse,
)
async def query_document(
    request: RAGQueryRequest,

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
) -> RAGQueryResponse:
    try:
        chunks = await rag_service.retrieve(
            document_id=(
                request.document_id
            ),
            user_id=current_user.id,
            query=request.query,
            top_k=request.top_k,
        )

        return RAGQueryResponse(
            document_id=(
                request.document_id
            ),
            query=request.query,
            chunks=chunks,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "RAG query failed: "
                f"{exc}"
            ),
        ) from exc