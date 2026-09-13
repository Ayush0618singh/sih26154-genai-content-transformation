import asyncio

from app.schemas.transformation import (
    ChunkDigest,
    ContentAnalysis,
)
from app.services.ai.gemini_service import (
    gemini_service,
)
from app.services.rag.chunker import (
    document_chunker,
)


DIRECT_ANALYSIS_LIMIT = 50000

MAX_ANALYSIS_CHUNKS = 30

ANALYSIS_CONCURRENCY = 3


class ContentAnalysisService:

    async def _analyse_direct(
        self,
        text: str,
        filename: str,
    ) -> ContentAnalysis:
        prompt = f"""
Analyze the following source document deeply.

Filename:
{filename}

Your job is to create a factual content-intelligence model.

Identify:
- inferred title
- content type
- one-line summary
- executive context
- major topics
- important factual claims
- named entities
- numbers and metrics
- stakeholders
- risks
- opportunities
- unresolved or important questions
- likely useful audiences
- source-quality limitations

Do not invent missing information.

SOURCE DOCUMENT
================
{text}
================
END SOURCE DOCUMENT
""".strip()

        return await (
            gemini_service
            .generate_structured(
                prompt,
                ContentAnalysis,
            )
        )

    async def _digest_chunk(
        self,
        text: str,
        chunk_number: int,
        total_chunks: int,
        semaphore: asyncio.Semaphore,
    ) -> ChunkDigest:
        prompt = f"""
Analyze source segment {chunk_number} of {total_chunks}.

Extract only information actually present in this segment.

Capture:
- concise summary
- key points
- factual claims
- important entities
- numerical metrics
- risks
- opportunities

SOURCE SEGMENT
==============
{text}
==============
END SEGMENT
""".strip()

        async with semaphore:
            return await (
                gemini_service
                .generate_structured(
                    prompt,
                    ChunkDigest,
                )
            )

    async def _analyse_large_document(
        self,
        text: str,
        filename: str,
    ) -> ContentAnalysis:
        chunks = document_chunker.split(
            text
        )

        if len(chunks) > MAX_ANALYSIS_CHUNKS:
            step = max(
                1,
                len(chunks)
                // MAX_ANALYSIS_CHUNKS,
            )

            chunks = chunks[
                ::step
            ][:MAX_ANALYSIS_CHUNKS]

        semaphore = asyncio.Semaphore(
            ANALYSIS_CONCURRENCY
        )

        tasks = [
            self._digest_chunk(
                chunk.text,
                index + 1,
                len(chunks),
                semaphore,
            )
            for index, chunk
            in enumerate(chunks)
        ]

        digests = await asyncio.gather(
            *tasks
        )

        digest_text = "\n\n".join(
            (
                f"SEGMENT {index + 1}\n"
                f"{digest.model_dump_json()}"
            )
            for index, digest
            in enumerate(digests)
        )

        prompt = f"""
Create one consolidated content-intelligence analysis
from the supplied segment analyses.

Original filename:
{filename}

Rules:
- Merge duplicates.
- Preserve important metrics and named entities.
- Never introduce facts absent from segment analyses.
- Mention source limitations where evidence is incomplete.
- Produce a coherent view of the complete document.

SEGMENT ANALYSES
================
{digest_text}
================
END SEGMENT ANALYSES
""".strip()

        return await (
            gemini_service
            .generate_structured(
                prompt,
                ContentAnalysis,
            )
        )

    async def analyse(
        self,
        text: str,
        filename: str,
    ) -> ContentAnalysis:
        clean_text = text.strip()

        if not clean_text:
            raise ValueError(
                "Cannot analyse empty content."
            )

        if (
            len(clean_text)
            <= DIRECT_ANALYSIS_LIMIT
        ):
            return await (
                self._analyse_direct(
                    clean_text,
                    filename,
                )
            )

        return await (
            self._analyse_large_document(
                clean_text,
                filename,
            )
        )


content_analysis_service = (
    ContentAnalysisService()
)