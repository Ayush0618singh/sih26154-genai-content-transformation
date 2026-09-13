import asyncio

from google import genai
from google.genai import types

from app.core.config import settings


class GeminiEmbeddingService:

    def __init__(self) -> None:
        self._client: genai.Client | None = None

    def _get_client(self) -> genai.Client:
        if not settings.gemini_api_key:
            raise RuntimeError(
                "GEMINI_API_KEY is not configured."
            )

        if self._client is None:
            self._client = genai.Client(
                api_key=settings.gemini_api_key
            )

        return self._client

    def _embed_batch_sync(
        self,
        texts: list[str],
    ) -> list[list[float]]:
        if not texts:
            return []

        client = self._get_client()

        contents = [
            types.Content(
                parts=[
                    types.Part.from_text(
                        text=text
                    )
                ]
            )
            for text in texts
        ]

        response = (
            client.models.embed_content(
                model=(
                    settings.gemini_embedding_model
                ),
                contents=contents,
                config=types.EmbedContentConfig(
                    output_dimensionality=(
                        settings.gemini_embedding_dimensions
                    )
                ),
            )
        )

        if not response.embeddings:
            raise RuntimeError(
                "Gemini returned no embeddings."
            )

        vectors: list[
            list[float]
        ] = []

        for embedding in response.embeddings:
            if not embedding.values:
                raise RuntimeError(
                    "Gemini returned an empty "
                    "embedding vector."
                )

            vectors.append(
                [
                    float(value)
                    for value in embedding.values
                ]
            )

        if len(vectors) != len(texts):
            raise RuntimeError(
                "Embedding count does not "
                "match input count."
            )

        return vectors

    async def embed_documents(
        self,
        texts: list[str],
        batch_size: int = 24,
    ) -> list[list[float]]:
        vectors: list[
            list[float]
        ] = []

        for start in range(
            0,
            len(texts),
            batch_size,
        ):
            batch = texts[
                start:start + batch_size
            ]

            batch_vectors = (
                await asyncio.to_thread(
                    self._embed_batch_sync,
                    batch,
                )
            )

            vectors.extend(
                batch_vectors
            )

        return vectors

    async def embed_query(
        self,
        query: str,
    ) -> list[float]:
        result = (
            await self.embed_documents(
                [query],
                batch_size=1,
            )
        )

        return result[0]


embedding_service = (
    GeminiEmbeddingService()
)