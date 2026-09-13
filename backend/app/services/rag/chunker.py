from dataclasses import dataclass

from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
)

from app.core.config import settings


@dataclass(slots=True)
class TextChunk:
    index: int
    text: str


class DocumentChunker:

    def __init__(self) -> None:
        self.splitter = (
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

    def split(
        self,
        text: str,
    ) -> list[TextChunk]:
        clean_text = text.strip()

        if not clean_text:
            return []

        chunks = (
            self.splitter.split_text(
                clean_text
            )
        )

        return [
            TextChunk(
                index=index,
                text=chunk.strip(),
            )
            for index, chunk
            in enumerate(chunks)
            if chunk.strip()
        ]


document_chunker = DocumentChunker()