import os
from html import escape
from pathlib import Path
from typing import Any

from reportlab.lib import colors
from reportlab.lib.enums import (
    TA_CENTER,
    TA_LEFT,
)
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    ParagraphStyle,
    getSampleStyleSheet,
)
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)

from app.services.generators.content_utils import (
    clean_text,
    ensure_parent_directory,
    get_content_json,
    humanize_key,
    output_title,
)


class PDFGenerator:

    def __init__(self) -> None:
        self.font_name = (
            self._register_font()
        )

    @staticmethod
    def _font_candidates() -> list[Path]:
        candidates: list[Path] = []

        environment_font = (
            os.getenv(
                "REPORTLAB_FONT_PATH"
            )
        )

        if environment_font:
            candidates.append(
                Path(environment_font)
            )

        candidates.extend(
            [
                Path(
                    "C:/Windows/Fonts/Nirmala.ttf"
                ),
                Path(
                    "C:/Windows/Fonts/arial.ttf"
                ),
                Path(
                    "/usr/share/fonts/truetype/"
                    "noto/NotoSans-Regular.ttf"
                ),
                Path(
                    "/usr/share/fonts/truetype/"
                    "dejavu/DejaVuSans.ttf"
                ),
            ]
        )

        return candidates

    def _register_font(
        self,
    ) -> str:
        for candidate in (
            self._font_candidates()
        ):
            if not candidate.exists():
                continue

            try:
                pdfmetrics.registerFont(
                    TTFont(
                        "GenAIUnicode",
                        str(candidate),
                    )
                )

                return "GenAIUnicode"

            except Exception:
                continue

        return "Helvetica"

    def _styles(
        self,
    ) -> dict[str, ParagraphStyle]:
        base = getSampleStyleSheet()

        title = ParagraphStyle(
            "GenAITitle",
            parent=base["Title"],
            fontName=self.font_name,
            fontSize=22,
            leading=28,
            alignment=TA_CENTER,
            spaceAfter=14,
            textColor=colors.HexColor(
                "#111827"
            ),
        )

        subtitle = ParagraphStyle(
            "GenAISubtitle",
            parent=base["Normal"],
            fontName=self.font_name,
            fontSize=10,
            leading=14,
            alignment=TA_CENTER,
            textColor=colors.HexColor(
                "#6B7280"
            ),
            spaceAfter=12,
        )

        heading1 = ParagraphStyle(
            "GenAIHeading1",
            parent=base["Heading1"],
            fontName=self.font_name,
            fontSize=16,
            leading=21,
            spaceBefore=8,
            spaceAfter=8,
            textColor=colors.HexColor(
                "#111827"
            ),
        )

        heading2 = ParagraphStyle(
            "GenAIHeading2",
            parent=base["Heading2"],
            fontName=self.font_name,
            fontSize=12,
            leading=16,
            spaceBefore=7,
            spaceAfter=5,
            textColor=colors.HexColor(
                "#1F2937"
            ),
        )

        body = ParagraphStyle(
            "GenAIBody",
            parent=base["BodyText"],
            fontName=self.font_name,
            fontSize=9.5,
            leading=14,
            alignment=TA_LEFT,
            textColor=colors.HexColor(
                "#374151"
            ),
            spaceAfter=6,
        )

        bullet = ParagraphStyle(
            "GenAIBullet",
            parent=body,
            leftIndent=12,
            firstLineIndent=-7,
            bulletIndent=5,
            spaceAfter=4,
        )

        return {
            "title": title,
            "subtitle": subtitle,
            "heading1": heading1,
            "heading2": heading2,
            "body": body,
            "bullet": bullet,
        }

    @staticmethod
    def _safe_html(
        text: Any,
    ) -> str:
        value = clean_text(
            text
        )

        return escape(
            value
        ).replace(
            "\n",
            "<br/>",
        )

    def _append_value(
        self,
        story: list,
        value: Any,
        styles: dict[
            str,
            ParagraphStyle,
        ],
        depth: int = 0,
    ) -> None:
        if value is None:
            return

        if isinstance(
            value,
            dict,
        ):
            for key, nested in (
                value.items()
            ):
                heading_style = (
                    styles["heading2"]
                    if depth <= 1
                    else styles["body"]
                )

                story.append(
                    Paragraph(
                        self._safe_html(
                            humanize_key(
                                str(key)
                            )
                        ),
                        heading_style,
                    )
                )

                self._append_value(
                    story,
                    nested,
                    styles,
                    depth + 1,
                )

            return

        if isinstance(
            value,
            list,
        ):
            for item in value:
                if isinstance(
                    item,
                    dict,
                ):
                    self._append_value(
                        story,
                        item,
                        styles,
                        depth + 1,
                    )

                    story.append(
                        Spacer(
                            1,
                            2 * mm,
                        )
                    )

                elif isinstance(
                    item,
                    list,
                ):
                    self._append_value(
                        story,
                        item,
                        styles,
                        depth + 1,
                    )

                else:
                    text = self._safe_html(
                        item
                    )

                    if text:
                        story.append(
                            Paragraph(
                                f"• {text}",
                                styles[
                                    "bullet"
                                ],
                            )
                        )

            return

        text = self._safe_html(
            value
        )

        if text:
            story.append(
                Paragraph(
                    text,
                    styles["body"],
                )
            )

    def generate(
        self,
        transformation: dict,
        outputs: list[dict],
        destination: Path,
    ) -> Path:
        ensure_parent_directory(
            destination
        )

        styles = self._styles()

        document = SimpleDocTemplate(
            str(destination),
            pagesize=A4,
            rightMargin=18 * mm,
            leftMargin=18 * mm,
            topMargin=18 * mm,
            bottomMargin=18 * mm,
            title=(
                transformation.get(
                    "title"
                )
                or (
                    "GenAI Content "
                    "Transformation"
                )
            ),
            author=(
                "SIH26154 GenAI "
                "Content Transformation"
            ),
        )

        story: list = []

        title = (
            transformation.get(
                "title"
            )
            or (
                "GenAI Content "
                "Transformation"
            )
        )

        story.append(
            Paragraph(
                self._safe_html(
                    title
                ),
                styles["title"],
            )
        )

        metadata_line = (
            f"Audience: "
            f"{transformation.get('target_audience') or 'General'}"
            f" | Tone: "
            f"{transformation.get('tone') or 'Professional'}"
            f" | Language: "
            f"{transformation.get('language') or 'English'}"
        )

        story.append(
            Paragraph(
                self._safe_html(
                    metadata_line
                ),
                styles["subtitle"],
            )
        )

        analysis = (
            transformation.get(
                "analysis_json"
            )
            or {}
        )

        if analysis:
            story.append(
                Paragraph(
                    "Content Intelligence",
                    styles["heading1"],
                )
            )

            important_analysis = {
                key: analysis.get(key)
                for key in (
                    "one_line_summary",
                    "executive_context",
                    "key_topics",
                    "key_facts",
                    "metrics",
                    "risks",
                    "opportunities",
                )
                if analysis.get(key)
            }

            self._append_value(
                story,
                important_analysis,
                styles,
            )

            story.append(
                PageBreak()
            )

        for output_index, output in (
            enumerate(outputs)
        ):
            story.append(
                Paragraph(
                    self._safe_html(
                        output_title(
                            output
                        )
                    ),
                    styles["heading1"],
                )
            )

            content = (
                get_content_json(
                    output
                )
            )

            self._append_value(
                story,
                content,
                styles,
            )

            if (
                output_index
                < len(outputs) - 1
            ):
                story.append(
                    PageBreak()
                )

        document.build(
            story
        )

        return destination


pdf_generator = PDFGenerator()