import ace from "ace-builds";
import { CodeContextValue } from "../context/code-context";
import "ace-builds/webpack-resolver"; // tell theme, syntax highlight module url to webpack

export function setupEditor(element: HTMLElement | null, ctx: CodeContextValue) {
  if (!element) return;
  const editor = ace.edit(element);
  editor.setOptions({});

  editor.setTheme("ace/theme/monokai");

  const editSession = editor.getSession();
  editSession.setTabSize(2);

  editSession.setValue(ctx.initialContent);
  editor.on("change", () => {
    ctx.code$.next(editSession.getValue());
  });

  return editor;
}
