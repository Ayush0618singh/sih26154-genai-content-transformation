from __future__ import annotations

import asyncio
import hashlib
import logging
import os

from typing import (
    Any,
)

from uuid import (
    UUID,
)

from google import (
    genai,
)

from google.genai import (
    types,
)

from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
)

from app.core.config import (
    settings,
)

from app.core.supabase import (
    get_supabase_admin_client,
)


logger = logging.getLogger(
    __name__
)


class RagServiceError(
    RuntimeError
):
    pass


def prepare_embedding_document(
    content: str,
    title: str | None = None,
) -> str:

    normalized_title = (
        title.strip()
        if (
            title
            and title.strip()
        )
        else "none"
    )

    return (
        f"title: {normalized_title} "
        f"| text: {content}"
    )


def prepare_embedding_query(
    query: str,
) -> str:

    return (
        "task: search result "
        f"| query: {query}"
    )


def split_rag_text(
    text: str,
) -> list[str]:

    splitter = (
        RecursiveCharacterTextSplitter(
            chunk_size=(
                settings.rag_chunk_size
            ),

            chunk_overlap=(
                settings.rag_chunk_overlap
            ),

            separators=[
                "\n\n",
                "\n",
                ". ",
                " ",
                "",
            ],
        )
    )


    return [
        chunk.strip()

        for chunk
        in splitter.split_text(
            text
        )

        if chunk.strip()
    ]


class RagService:

    def __init__(
        self,
    ) -> None:

        self._gemini_client: (
            genai.Client | None
        ) = None


    def _client(
        self,
    ) -> genai.Client:

        if self._gemini_client is None:

            if not settings.gemini_api_key:

                raise RagServiceError(
                    "GEMINI_API_KEY "
                    "is not configured."
                )


            self._gemini_client = (
                genai.Client(
                    api_key=(
                        settings.gemini_api_key
                    )
                )
            )


        return self._gemini_client


    @property
    def embedding_model(
        self,
    ) -> str:

        return (
            settings
            .gemini_embedding_model
        )


    @property
    def embedding_dimensions(
        self,
    ) -> int:

        return int(
            settings
            .gemini_embedding_dimensions
        )


    @property
    def embed_concurrency(
        self,
    ) -> int:

        raw = os.getenv(
            "RAG_EMBED_CONCURRENCY",
            "4",
        )

        try:

            value = int(
                raw
            )

        except ValueError:

            value = 4


        return max(
            1,
            min(
                value,
                8,
            ),
        )


    @property
    def default_min_similarity(
        self,
    ) -> float:

        raw = os.getenv(
            "RAG_MIN_SIMILARITY",
            "0.20",
        )

        try:

            value = float(
                raw
            )

        except ValueError:

            value = 0.20


        return max(
            0.0,
            min(
                value,
                1.0,
            ),
        )


    def _embed_sync(
        self,
        *,
        text: str,
        purpose: str,
        title: str | None = None,
    ) -> list[float]:

        client = (
            self._client()
        )


        model_name = (
            self.embedding_model
        )


        is_embedding_2 = (
            "embedding-2"
            in model_name.lower()
        )


        if purpose == "document":

            input_text = (
                prepare_embedding_document(
                    text,
                    title,
                )
                if is_embedding_2
                else text
            )

        elif purpose == "query":

            input_text = (
                prepare_embedding_query(
                    text
                )
                if is_embedding_2
                else text
            )

        else:

            raise ValueError(
                "purpose must be "
                "'document' or 'query'."
            )


        config_kwargs: dict[
            str,
            Any,
        ] = {
            "output_dimensionality":
                self.embedding_dimensions,
        }


        # Gemini Embedding 2 uses task instructions
        # directly in text rather than task_type.
        #
        # Earlier embedding models use task_type.

        if not is_embedding_2:

            config_kwargs[
                "task_type"
            ] = (
                "RETRIEVAL_DOCUMENT"
                if purpose
                == "document"
                else "RETRIEVAL_QUERY"
            )


            if (
                purpose
                == "document"
                and title
            ):

                config_kwargs[
                    "title"
                ] = title


        result = (
            client.models.embed_content(
                model=(
                    model_name
                ),

                contents=(
                    input_text
                ),

                config=(
                    types.EmbedContentConfig(
                        **config_kwargs
                    )
                ),
            )
        )


        embeddings = (
            result.embeddings
            or []
        )


        if not embeddings:

            raise RagServiceError(
                "Gemini returned "
                "no embedding."
            )


        values = (
            embeddings[
                0
            ].values
        )


        if not values:

            raise RagServiceError(
                "Gemini returned an "
                "empty embedding."
            )


        vector = [
            float(
                value
            )
            for value
            in values
        ]


        if (
            len(
                vector
            )
            != self.embedding_dimensions
        ):

            raise RagServiceError(
                (
                    "Embedding dimension mismatch. "
                    f"Expected "
                    f"{self.embedding_dimensions}, "
                    f"received "
                    f"{len(vector)}."
                )
            )


        return vector


    async def _embed(
        self,
        *,
        text: str,
        purpose: str,
        title: str | None = None,
    ) -> list[float]:

        return await asyncio.to_thread(
            self._embed_sync,

            text=(
                text
            ),

            purpose=(
                purpose
            ),

            title=(
                title
            ),
        )


    async def _embed_document_chunks(
        self,
        *,
        chunks: list[str],
        title: str | None,
    ) -> list[
        list[float]
    ]:

        semaphore = (
            asyncio.Semaphore(
                self.embed_concurrency
            )
        )


        async def embed_one(
            chunk: str,
        ) -> list[float]:

            async with semaphore:

                return await self._embed(
                    text=(
                        chunk
                    ),

                    purpose=(
                        "document"
                    ),

                    title=(
                        title
                    ),
                )


        return list(
            await asyncio.gather(
                *[
                    embed_one(
                        chunk
                    )
                    for chunk
                    in chunks
                ]
            )
        )


    def _set_index_state(
        self,
        *,
        user_id: str,
        document_id: str,
        status: str,
        chunk_count: int,
    ) -> None:

        admin = (
            get_supabase_admin_client()
        )


        (
            admin
            .table(
                "rag_indexes"
            )
            .upsert(
                {
                    "user_id":
                        user_id,

                    "source_document_id":
                        document_id,

                    "status":
                        status,

                    "chunk_count":
                        chunk_count,
                },

                on_conflict=(
                    "source_document_id"
                ),
            )
            .execute()
        )


    async def index_document(
        self,
        *,
        document_id:
            UUID | str,

        user_id:
            UUID | str,
    ) -> dict[
        str,
        Any,
    ]:

        admin = (
            get_supabase_admin_client()
        )


        document_id_str = str(
            document_id
        )

        user_id_str = str(
            user_id
        )


        response = (
            admin
            .table(
                "source_documents"
            )
            .select(
                (
                    "id,"
                    "user_id,"
                    "original_filename,"
                    "input_type,"
                    "status,"
                    "extracted_text,"
                    "metadata"
                )
            )
            .eq(
                "id",
                document_id_str,
            )
            .eq(
                "user_id",
                user_id_str,
            )
            .limit(
                1
            )
            .execute()
        )


        rows = (
            response.data
            or []
        )


        if not rows:

            raise ValueError(
                "Document not found."
            )


        document = (
            rows[
                0
            ]
        )


        if (
            document.get(
                "status"
            )
            != "ready"
        ):

            raise RagServiceError(
                "Document is not ready "
                "for RAG indexing."
            )


        text = (
            document.get(
                "extracted_text"
            )
            or ""
        ).strip()


        if not text:

            raise RagServiceError(
                "Document contains no "
                "extracted text."
            )


        title = (
            document.get(
                "original_filename"
            )
        )


        chunks = (
            split_rag_text(
                text
            )
        )


        if not chunks:

            raise RagServiceError(
                "No RAG chunks could "
                "be created."
            )


        self._set_index_state(
            user_id=(
                user_id_str
            ),

            document_id=(
                document_id_str
            ),

            status=(
                "indexing"
            ),

            chunk_count=(
                0
            ),
        )


        try:

            embeddings = (
                await self
                ._embed_document_chunks(
                    chunks=(
                        chunks
                    ),

                    title=(
                        title
                    ),
                )
            )


            records: list[
                dict[
                    str,
                    Any,
                ]
            ] = []


            source_metadata = (
                document.get(
                    "metadata"
                )
                or {}
            )


            for (
                index,
                (
                    chunk,
                    embedding,
                ),
            ) in enumerate(
                zip(
                    chunks,
                    embeddings,
                    strict=True,
                )
            ):

                content_hash = (
                    hashlib.sha256(
                        chunk.encode(
                            "utf-8"
                        )
                    )
                    .hexdigest()
                )


                records.append(
                    {
                        "user_id":
                            user_id_str,

                        "source_document_id":
                            document_id_str,

                        "chunk_index":
                            index,

                        "content":
                            chunk,

                        "content_hash":
                            content_hash,

                        "metadata": {
                            "title":
                                title,

                            "input_type":
                                document.get(
                                    "input_type"
                                ),

                            "chunk_index":
                                index,

                            "extraction_method":
                                source_metadata.get(
                                    "extraction_method"
                                ),
                        },

                        "embedding":
                            embedding,
                    }
                )


            # Replace the index only AFTER embeddings
            # have been generated successfully.

            (
                admin
                .table(
                    "rag_chunks"
                )
                .delete()
                .eq(
                    "source_document_id",
                    document_id_str,
                )
                .eq(
                    "user_id",
                    user_id_str,
                )
                .execute()
            )


            batch_size = 25


            for start in range(
                0,
                len(
                    records
                ),
                batch_size,
            ):

                batch = (
                    records[
                        start:
                        start
                        + batch_size
                    ]
                )


                (
                    admin
                    .table(
                        "rag_chunks"
                    )
                    .insert(
                        batch
                    )
                    .execute()
                )


            self._set_index_state(
                user_id=(
                    user_id_str
                ),

                document_id=(
                    document_id_str
                ),

                status=(
                    "ready"
                ),

                chunk_count=(
                    len(
                        records
                    )
                ),
            )


            logger.info(
                (
                    "rag_index_complete "
                    "document_id=%s "
                    "chunks=%s"
                ),
                document_id_str,
                len(
                    records
                ),
            )


            return {
                "document_id":
                    document_id_str,

                "status":
                    "ready",

                "chunk_count":
                    len(
                        records
                    ),

                "provider":
                    "supabase_pgvector",

                "embedding_model":
                    self.embedding_model,

                "embedding_dimensions":
                    self.embedding_dimensions,
            }


        except Exception:

            try:

                self._set_index_state(
                    user_id=(
                        user_id_str
                    ),

                    document_id=(
                        document_id_str
                    ),

                    status=(
                        "failed"
                    ),

                    chunk_count=(
                        0
                    ),
                )

            except Exception:

                pass


            raise


    async def query(
        self,
        *,
        user_id:
            UUID | str,

        query:
            str,

        document_id:
            UUID | str | None = None,

        top_k:
            int | None = None,

        min_similarity:
            float | None = None,
    ) -> list[
        dict[
            str,
            Any,
        ]
    ]:

        normalized_query = (
            query.strip()
        )


        if not normalized_query:

            raise ValueError(
                "RAG query cannot be empty."
            )


        query_embedding = (
            await self._embed(
                text=(
                    normalized_query
                ),

                purpose=(
                    "query"
                ),
            )
        )


        resolved_top_k = (
            top_k
            or settings.rag_top_k
        )


        resolved_similarity = (
            self.default_min_similarity
            if min_similarity
            is None
            else min_similarity
        )


        admin = (
            get_supabase_admin_client()
        )


        response = (
            admin.rpc(
                "match_rag_chunks",

                {
                    "query_embedding":
                        query_embedding,

                    "match_user_id":
                        str(
                            user_id
                        ),

                    "match_document_id":
                        (
                            str(
                                document_id
                            )
                            if document_id
                            is not None
                            else None
                        ),

                    "match_count":
                        int(
                            resolved_top_k
                        ),

                    "min_similarity":
                        float(
                            resolved_similarity
                        ),
                },
            )
            .execute()
        )


        return list(
            response.data
            or []
        )


    async def retrieve(
        self,
        *,
        user_id:
            UUID | str,

        query:
            str,

        document_id:
            UUID | str | None = None,

        top_k:
            int | None = None,

        min_similarity:
            float | None = None,
    ) -> list[
        dict[
            str,
            Any,
        ]
    ]:

        return await self.query(
            user_id=(
                user_id
            ),

            query=(
                query
            ),

            document_id=(
                document_id
            ),

            top_k=(
                top_k
            ),

            min_similarity=(
                min_similarity
            ),
        )


    async def retrieve_context(
        self,
        *,
        user_id:
            UUID | str,

        query:
            str,

        document_id:
            UUID | str | None = None,

        top_k:
            int | None = None,
    ) -> str:

        results = (
            await self.query(
                user_id=(
                    user_id
                ),

                query=(
                    query
                ),

                document_id=(
                    document_id
                ),

                top_k=(
                    top_k
                ),
            )
        )


        sections: list[
            str
        ] = []


        for item in (
            results
        ):

            similarity = float(
                item.get(
                    "similarity",
                    0,
                )
            )


            sections.append(
                (
                    "[SOURCE CHUNK "
                    f"{item.get('chunk_index')} "
                    f"| similarity="
                    f"{similarity:.4f}]\n"
                    f"{item.get('content', '')}"
                )
            )


        return (
            "\n\n".join(
                sections
            )
        )


    async def delete_document_index(
        self,
        *,
        document_id:
            UUID | str,

        user_id:
            UUID | str,
    ) -> None:

        admin = (
            get_supabase_admin_client()
        )


        (
            admin
            .table(
                "rag_chunks"
            )
            .delete()
            .eq(
                "source_document_id",
                str(
                    document_id
                ),
            )
            .eq(
                "user_id",
                str(
                    user_id
                ),
            )
            .execute()
        )


        (
            admin
            .table(
                "rag_indexes"
            )
            .delete()
            .eq(
                "source_document_id",
                str(
                    document_id
                ),
            )
            .eq(
                "user_id",
                str(
                    user_id
                ),
            )
            .execute()
        )


rag_service = (
    RagService()
)