from uuid import UUID

from app.core.config import settings
from app.core.supabase import (
    get_supabase_admin_client,
)
from app.schemas.rag import RetrievedChunk
from app.services.rag.chroma_service import (
    chroma_service,
)
from app.services.rag.chunker import (
    document_chunker,
)
from app.services.rag.embedding_service import (
    embedding_service,
)


class RAGService:

    def __init__(self) -> None:
        self.admin = (
            get_supabase_admin_client()
        )

    def _get_document(
        self,
        document_id: UUID,
        user_id: UUID,
    ) -> dict:
        response = (
            self.admin.table(
                "source_documents"
            )
            .select(
                "id, user_id, original_filename, "
                "status, extracted_text"
            )
            .eq(
                "id",
                str(document_id),
            )
            .eq(
                "user_id",
                str(user_id),
            )
            .limit(1)
            .execute()
        )

        if not response.data:
            raise ValueError(
                "Document not found."
            )

        document = response.data[0]

        if document.get("status") != "ready":
            raise ValueError(
                "Document is not ready "
                "for RAG indexing."
            )

        if not (
            document.get(
                "extracted_text"
            )
            or ""
        ).strip():
            raise ValueError(
                "Document contains no "
                "extracted text."
            )

        return document

    def _get_index_record(
        self,
        document_id: UUID,
        user_id: UUID,
    ) -> dict | None:
        response = (
            self.admin.table(
                "rag_indexes"
            )
            .select("*")
            .eq(
                "source_document_id",
                str(document_id),
            )
            .eq(
                "user_id",
                str(user_id),
            )
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        return response.data[0]

    async def ensure_index(
        self,
        document_id: UUID,
        user_id: UUID,
        force: bool = False,
    ) -> tuple[str, int]:
        existing = self._get_index_record(
            document_id,
            user_id,
        )

        if (
            existing
            and existing.get("status")
            == "ready"
            and not force
        ):
            return (
                str(
                    existing[
                        "collection_name"
                    ]
                ),
                int(
                    existing.get(
                        "chunk_count"
                    )
                    or 0
                ),
            )

        document = self._get_document(
            document_id,
            user_id,
        )

        collection_name = (
            chroma_service
            .collection_name_for_document(
                str(document_id)
            )
        )

        if force:
            await (
                chroma_service
                .delete_collection(
                    collection_name
                )
            )

        if existing:
            (
                self.admin.table(
                    "rag_indexes"
                )
                .update(
                    {
                        "status": "indexing",
                        "collection_name": (
                            collection_name
                        ),
                        "chunk_count": 0,
                    }
                )
                .eq(
                    "id",
                    existing["id"],
                )
                .execute()
            )
        else:
            (
                self.admin.table(
                    "rag_indexes"
                )
                .insert(
                    {
                        "user_id": str(
                            user_id
                        ),
                        "source_document_id": str(
                            document_id
                        ),
                        "provider": (
                            settings.vector_store_provider
                        ),
                        "collection_name": (
                            collection_name
                        ),
                        "chunk_count": 0,
                        "status": "indexing",
                    }
                )
                .execute()
            )

        try:
            chunks = document_chunker.split(
                document[
                    "extracted_text"
                ]
            )

            if not chunks:
                raise ValueError(
                    "No text chunks were "
                    "created."
                )

            texts = [
                chunk.text
                for chunk in chunks
            ]

            embeddings = (
                await embedding_service
                .embed_documents(
                    texts
                )
            )

            ids = [
                (
                    f"{document_id}"
                    f"_chunk_{chunk.index}"
                )
                for chunk in chunks
            ]

            metadatas = [
                {
                    "document_id": str(
                        document_id
                    ),
                    "user_id": str(
                        user_id
                    ),
                    "filename": str(
                        document[
                            "original_filename"
                        ]
                    ),
                    "chunk_index": (
                        chunk.index
                    ),
                }
                for chunk in chunks
            ]

            await chroma_service.upsert(
                collection_name=(
                    collection_name
                ),
                ids=ids,
                texts=texts,
                embeddings=embeddings,
                metadatas=metadatas,
            )

            (
                self.admin.table(
                    "rag_indexes"
                )
                .update(
                    {
                        "status": "ready",
                        "collection_name": (
                            collection_name
                        ),
                        "chunk_count": len(
                            chunks
                        ),
                        "metadata": {
                            "embedding_model": (
                                settings
                                .gemini_embedding_model
                            ),
                            "embedding_dimensions": (
                                settings
                                .gemini_embedding_dimensions
                            ),
                            "chunk_size": (
                                settings
                                .rag_chunk_size
                            ),
                            "chunk_overlap": (
                                settings
                                .rag_chunk_overlap
                            ),
                        },
                    }
                )
                .eq(
                    "source_document_id",
                    str(document_id),
                )
                .eq(
                    "user_id",
                    str(user_id),
                )
                .execute()
            )

            (
                self.admin.table(
                    "activity_events"
                )
                .insert(
                    {
                        "user_id": str(
                            user_id
                        ),
                        "event_type": (
                            "rag_index_created"
                        ),
                        "source_document_id": (
                            str(document_id)
                        ),
                        "metadata": {
                            "collection_name": (
                                collection_name
                            ),
                            "chunk_count": len(
                                chunks
                            ),
                        },
                    }
                )
                .execute()
            )

            return (
                collection_name,
                len(chunks),
            )

        except Exception:
            (
                self.admin.table(
                    "rag_indexes"
                )
                .update(
                    {
                        "status": "failed",
                    }
                )
                .eq(
                    "source_document_id",
                    str(document_id),
                )
                .eq(
                    "user_id",
                    str(user_id),
                )
                .execute()
            )

            raise

    async def retrieve(
        self,
        document_id: UUID,
        user_id: UUID,
        query: str,
        top_k: int | None = None,
    ) -> list[RetrievedChunk]:
        collection_name, _ = (
            await self.ensure_index(
                document_id,
                user_id,
            )
        )

        query_embedding = (
            await embedding_service
            .embed_query(
                query
            )
        )

        return await (
            chroma_service.query(
                collection_name=(
                    collection_name
                ),
                query_embedding=(
                    query_embedding
                ),
                top_k=(
                    top_k
                    or settings.rag_top_k
                ),
            )
        )


rag_service = RAGService()