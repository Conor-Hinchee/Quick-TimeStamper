import { Plugin, MarkdownView } from 'obsidian';

export default class QuickTimestamper extends Plugin {

    onload() {

        this.registerMarkdownCodeBlockProcessor("quick-timestamp-button", (source, el, ctx) => {
            const button = el.createEl("button", { text: "Log Time" });
            const output = el.createEl("p");

            button.addEventListener("click", () => {
                const now = new Date();
                const timestamp = `Logged at: ${now.toLocaleString()}`;
                output.textContent = timestamp;

                const view = this.app.workspace.getActiveViewOfType(MarkdownView);

                if (view) {
                    const editor = view.editor;
                    // // Get the position of the code block
                    const sectionInfo = ctx.getSectionInfo(el);
                    const endLine = sectionInfo?.lineStart || 0;
                    // REPLACE THE BUTTON WITH THE TIMESTAMP
                    editor.setLine(endLine, timestamp);
                    // replace the line below the button as well
                    editor.setLine(endLine + 1, "");
                }
            });
        });
    }
}
