from uuid import (
    UUID,
)

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
    RagIndexResponse,
    RagQueryRequest,
    RagQueryResponse,
    RagSearchResult,
)

from app.services.rag.rag_service import (
    rag_service,
)


router = APIRouter(
    prefix="/rag",
    tags=[
        "RAG",
    ],
)


@router.post(
    "/index/{document_id}",
    response_model=(
        RagIndexResponse
    ),
)
async def index_document(
    document_id:
        UUID,

    current_user:
        AuthenticatedUser = Depends(
            get_current_user
        ),
) -> RagIndexResponse:

    try:

        result = (
            await rag_service
            .index_document(
                document_id=(
                    document_id
                ),

                user_id=(
                    current_user.id
                ),
            )
        )


        return (
            RagIndexResponse(
                **result
            )
        )


    except ValueError as exc:

        raise HTTPException(
            status_code=404,
            detail=str(
                exc
            ),
        ) from exc


    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                "RAG indexing failed."
            ),
        ) from exc


@router.post(
    "/query",
    response_model=(
        RagQueryResponse
    ),
)
async def query_rag(
    request:
        RagQueryRequest,

    current_user:
        AuthenticatedUser = Depends(
            get_current_user
        ),
) -> RagQueryResponse:

    try:

        results = (
            await rag_service.query(
                user_id=(
                    current_user.id
                ),

                query=(
                    request.query
                ),

                document_id=(
                    request.document_id
                ),

                top_k=(
                    request.top_k
                ),

                min_similarity=(
                    request.min_similarity
                ),
            )
        )


        parsed_results = [
            RagSearchResult(
                id=(
                    item[
                        "id"
                    ]
                ),

                source_document_id=(
                    item[
                        "source_document_id"
                    ]
                ),

                chunk_index=(
                    item[
                        "chunk_index"
                    ]
                ),

                content=(
                    item[
                        "content"
                    ]
                ),

                similarity=(
                    item[
                        "similarity"
                    ]
                ),

                metadata=(
                    item.get(
                        "metadata"
                    )
                    or {}
                ),
            )

            for item
            in results
        ]


        return (
            RagQueryResponse(
                query=(
                    request.query
                ),

                document_id=(
                    request.document_id
                ),

                result_count=(
                    len(
                        parsed_results
                    )
                ),

                results=(
                    parsed_results
                ),
            )
        )


    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                "RAG query failed."
            ),
        ) from exc