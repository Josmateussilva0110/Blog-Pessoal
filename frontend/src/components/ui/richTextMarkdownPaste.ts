import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

const FENCED_CODE_REGEX = /^```([a-zA-Z0-9_-]+)?\r?\n([\s\S]*?)```$/;

function parseFencedCode(text: string) {
  const match = text.trim().match(FENCED_CODE_REGEX);
  if (!match) return null;

  return {
    language: match[1] || null,
    code: match[2].replace(/\r?\n$/, ""),
  };
}

export const RichTextMarkdownPaste = Extension.create({
  name: "richTextMarkdownPaste",

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: new PluginKey("richTextMarkdownPaste"),
        props: {
          handlePaste(_view, event) {
            const text = event.clipboardData?.getData("text/plain");
            if (!text) return false;

            const parsed = parseFencedCode(text);
            if (!parsed) return false;

            editor
              .chain()
              .focus()
              .insertContent({
                type: "codeBlock",
                attrs: { language: parsed.language },
                content: parsed.code
                  ? [{ type: "text", text: parsed.code }]
                  : [],
              })
              .run();

            return true;
          },
        },
      }),
    ];
  },
});
