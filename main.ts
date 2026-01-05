import { Plugin, MarkdownPostProcessorContext, MarkdownView } from 'obsidian';

type SectionKey = string;

const MARKER_REGEX = /`{1,3}quick-timestamp-button`{1,3}/g;

export default class QuickTimestamper extends Plugin {
    onload() {
        const inlineCounters = new Map<SectionKey, number>();

        const replaceInlineMarker = (markerIndex: number, sectionInfo: { lineStart: number; lineEnd: number }, view: MarkdownView, replacement: string) => {
            const { lineStart, lineEnd } = sectionInfo;
            const lines: string[] = [];
            for (let i = lineStart; i <= lineEnd; i++) {
                lines.push(view.editor.getLine(i));
            }

            const sectionText = lines.join("\n");
            MARKER_REGEX.lastIndex = 0;
            let match: RegExpExecArray | null;
            let current = 0;
            let targetMatch: RegExpExecArray | null = null;

            while ((match = MARKER_REGEX.exec(sectionText)) !== null) {
                current += 1;
                if (current === markerIndex) {
                    targetMatch = match;
                    break;
                }
            }

            if (!targetMatch) {
                return false;
            }

            const startOffset = targetMatch.index;
            const endOffset = targetMatch.index + targetMatch[0].length;

            // Convert offsets back to line/column positions
            let offset = 0;
            let startPos = { line: lineStart, ch: 0 };
            let endPos = { line: lineStart, ch: 0 };

            for (let i = 0; i < lines.length; i++) {
                const lineText = lines[i];
                const lineLen = lineText.length;

                if (startOffset >= offset && startOffset <= offset + lineLen) {
                    startPos = { line: lineStart + i, ch: startOffset - offset };
                }

                if (endOffset >= offset && endOffset <= offset + lineLen) {
                    endPos = { line: lineStart + i, ch: endOffset - offset };
                    break;
                }

                offset += lineLen + 1; // include newline
            }

            view.editor.replaceRange(replacement, startPos, endPos);
            return true;
        };

        const renderButton = (host: HTMLElement, ctx: MarkdownPostProcessorContext, markerIndex?: number) => {
            const container = host.createEl("span");
            const button = container.createEl("button", { text: "🪵 Time" });

            button.addEventListener("click", async () => {
                console.log("DEBUG ENABLED: QuickTimestamper clicked");
                try {
                    const now = new Date();
                    const hours = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');
                    const seconds = String(now.getSeconds()).padStart(2, '0');

                    const timestamp = `🪵 Logged at: ${hours}:${minutes}:${seconds}`;
                    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
                    const sectionInfo = ctx.getSectionInfo(host);
                    if (!view || !view.editor || !view.file) {
                        throw new Error("Markdown view or editor not found.");
                    }

                    if (!sectionInfo) {
                        throw new Error("Section info not found.");
                    }

                    let handledInline = false;
                    if (typeof markerIndex === "number" && markerIndex > 0) {
                        handledInline = replaceInlineMarker(markerIndex, sectionInfo, view, timestamp);
                    }

                    if (!handledInline) {
                        const position = { line: sectionInfo.lineEnd + 1, ch: 0 };
                        view.editor.replaceRange(timestamp + '\n', position);
                    }

                    await this.app.vault.modify(view.file, view.editor.getValue());

                } catch (error) {
                    console.error("Error in QuickTimestamper:", error);
                }
            });

            return container;
        };

        this.registerMarkdownCodeBlockProcessor("quick-timestamp-button", (source, el, ctx) => {
            renderButton(el, ctx);
        });

        this.registerMarkdownPostProcessor((el, ctx) => {
            const inlineCodes = el.querySelectorAll("code");

            inlineCodes.forEach((codeEl) => {
                if (codeEl.closest("pre")) {
                    return;
                }

                const text = codeEl.textContent?.trim();
                if (text === "quick-timestamp-button") {
                    const sectionInfo = ctx.getSectionInfo(codeEl);
                    if (!sectionInfo) {
                        return;
                    }

                    const key: SectionKey = `${sectionInfo.lineStart}-${sectionInfo.lineEnd}`;
                    const nextIndex = (inlineCounters.get(key) ?? 0) + 1;
                    inlineCounters.set(key, nextIndex);

                    const wrapper = document.createElement("span");
                    codeEl.replaceWith(wrapper);
                    renderButton(wrapper, ctx, nextIndex);
                }
            });
        });
    }
}
