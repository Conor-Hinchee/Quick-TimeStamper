import { App, Plugin, PluginSettingTab, Setting, MarkdownView } from 'obsidian';

interface QuickTimestamperSettings {
    mySetting: string;
}

const DEFAULT_SETTINGS: QuickTimestamperSettings = {
    mySetting: 'default'
}

export default class QuickTimestamper extends Plugin {
    settings: QuickTimestamperSettings;

    // async onload() {
    //     // await this.loadSettings();

    //     // This adds a settings tab so the user can configure various aspects of the plugin
    //     // this.addSettingTab(new SampleSettingTab(this.app, this));

    //     // Register the 'log-time' Markdown code block processor
    //     this.registerMarkdownCodeBlockProcessor("log-time", (source, el, ctx) => {
    //         const button = el.createEl("button", { text: "Log Time" });
    //         const output = el.createEl("p");

    //         button.addEventListener("click", () => {
    //             const now = new Date();
    //             output.textContent = `Logged at: ${now.toLocaleString()}`;
    //         });
    //     });
    // }

    async onload() {
        // await this.loadSettings();

        // This adds a settings tab so the user can configure various aspects of the plugin
        // this.addSettingTab(new SampleSettingTab(this.app, this));

        // Register the 'log-time' Markdown code block processor
        this.registerMarkdownCodeBlockProcessor("log-time", (source, el, ctx) => {
            const button = el.createEl("button", { text: "Log Time" });
            const output = el.createEl("p");

            button.addEventListener("click", () => {
                const now = new Date();
                const timestamp = `Logged at: ${now.toLocaleString()}`;
                output.textContent = timestamp;

                // Get the active Markdown view
                const view = this.app.workspace.getActiveViewOfType(MarkdownView);

                if (view) {
                    // Get the editor
                    const editor = view.editor;

                    // Insert the timestamp at the current cursor position
                    editor.replaceRange(timestamp, editor.getCursor());
                }
            });
        });
    }

    

    onunload() {

    }

    // async loadSettings() {
    //     this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    // }

    // async saveSettings() {
    //     await this.saveData(this.settings);
    // }
}

class SampleSettingTab extends PluginSettingTab {
    plugin: QuickTimestamper;

    constructor(app: App, plugin: QuickTimestamper) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('Setting #1')
            .setDesc('It\'s a secret')
            .addText(text => text
                .setPlaceholder('Enter your secret')
                .setValue(this.plugin.settings.mySetting)
                .onChange(async (value) => {
                    this.plugin.settings.mySetting = value;
                    // await this.plugin.saveSettings();
                }));
    }
}
