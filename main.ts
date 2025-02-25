import { Plugin, MarkdownView } from 'obsidian';

export default class QuickTimestamper extends Plugin {

    onload() {
        this.registerMarkdownCodeBlockProcessor("quick-timestamp-button", (source, el, ctx) => {
            const button = el.createEl("button", { text: "Log Time" });
            const output = el.createEl("p");

            // Show existing timestamps from the source
            if (source.trim()) {
                output.textContent = source.trim();
            }

            button.addEventListener("click", () => {
                const now = new Date();
                const timestamp = `Logged at: ${now.toLocaleString()}`;
                output.textContent = timestamp;

                const view = this.app.workspace.getActiveViewOfType(MarkdownView);
                
                if (view) {
                    const editor = view.editor;
                    const sectionInfo = ctx.getSectionInfo(el);
                    
                    if (sectionInfo) {
                        // Create a transaction to modify the document
                        editor.transaction({
                            changes: [{
                                from: editor.offsetToPos(sectionInfo.lineStart),
                                to: editor.offsetToPos(sectionInfo.lineEnd),
                                text: "```quick-timestamp-button\n" + timestamp + "\n```"
                            }]
                        });
                    }
                }
            });
        });
    }
}
