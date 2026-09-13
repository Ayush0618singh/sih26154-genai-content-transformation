import asyncio
from functools import lru_cache
from typing import Any

import chromadb

from app.core.config import settings
from app.schemas.rag import RetrievedChunk


class ChromaService:

    def __init__(self) -> None:
        settings.chroma_directory_path.mkdir(
            parents=True,
            exist_ok=True,
        )

        self.client = chromadb.PersistentClient(
            path=str(
                settings.chroma_directory_path
            )
        )

    @staticmethod
    def collection_name_for_document(
        document_id: str,
    ) -> str:
        cleaned = document_id.replace(
            "-",
            "",
        )

        return f"doc_{cleaned}"

    def _upsert_sync(
        self,
        collection_name: str,
        ids: list[str],
        texts: list[str],
        embeddings: list[list[float]],
        metadatas: list[
            dict[str, Any]
        ],
    ) -> None:
        collection = (
            self.client.get_or_create_collection(
                name=collection_name,
                metadata={
                    "hnsw:space": "cosine",
                },
            )
        )

        collection.upsert(
            ids=ids,
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas,
        )

    async def upsert(
        self,
        collection_name: str,
        ids: list[str],
        texts: list[str],
        embeddings: list[list[float]],
        metadatas: list[
            dict[str, Any]
        ],
    ) -> None:
        await asyncio.to_thread(
            self._upsert_sync,
            collection_name,
            ids,
            texts,
            embeddings,
            metadatas,
        )

    def _query_sync(
        self,
        collection_name: str,
        query_embedding: list[float],
        top_k: int,
    ) -> list[RetrievedChunk]:
        collection = (
            self.client.get_collection(
                name=collection_name
            )
        )

        count = collection.count()

        if count == 0:
            return []

        result = collection.query(
            query_embeddings=[
                query_embedding
            ],
            n_results=min(
                top_k,
                count,
            ),
            include=[
                "documents",
                "metadatas",
                "distances",
            ],
        )

        ids = (
            result.get("ids")
            or [[]]
        )[0]

        documents = (
            result.get("documents")
            or [[]]
        )[0]

        metadatas = (
            result.get("metadatas")
            or [[]]
        )[0]

        distances = (
            result.get("distances")
            or [[]]
        )[0]

        chunks: list[
            RetrievedChunk
        ] = []

        for index, chunk_id in enumerate(
            ids
        ):
            text = (
                documents[index]
                if index < len(documents)
                else ""
            )

            metadata = (
                metadatas[index]
                if index < len(metadatas)
                and metadatas[index]
                else {}
            )

            distance = (
                distances[index]
                if index < len(distances)
                else None
            )

            chunks.append(
                RetrievedChunk(
                    chunk_id=str(
                        chunk_id
                    ),
                    text=str(
                        text or ""
                    ),
                    distance=(
                        float(distance)
                        if distance is not None
                        else None
                    ),
                    metadata=dict(
                        metadata
                    ),
                )
            )

        return chunks

    async def query(
        self,
        collection_name: str,
        query_embedding: list[float],
        top_k: int,
    ) -> list[RetrievedChunk]:
        return await asyncio.to_thread(
            self._query_sync,
            collection_name,
            query_embedding,
            top_k,
        )

    def _delete_sync(
        self,
        collection_name: str,
    ) -> None:
        try:
            self.client.delete_collection(
                name=collection_name
            )
        except Exception:
            pass

    async def delete_collection(
        self,
        collection_name: str,
    ) -> None:
        await asyncio.to_thread(
            self._delete_sync,
            collection_name,
        )


@lru_cache
def get_chroma_service() -> ChromaService:
    return ChromaService()


chroma_service = get_chroma_service()