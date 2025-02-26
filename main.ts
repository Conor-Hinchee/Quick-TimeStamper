import { Plugin, MarkdownView } from 'obsidian';

export default class QuickTimestamper extends Plugin {
    onload() {
        this.registerMarkdownCodeBlockProcessor("quick-timestamp-button", (source, el, ctx) => {
            const container = el.createEl("div");
            const button = container.createEl("button", { text: "Log Time" });

            button.addEventListener("click", async () => {
                const now = new Date();
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');

                const timestamp = `🪵 Logged at: ${hours}:${minutes}:${seconds}`;

                const view = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (view) {
                    view.editor.replaceRange(timestamp, view.editor.getCursor());
                    button.remove(); // Remove the button after logging the timestamp
                }
            });
        });
    }
}
