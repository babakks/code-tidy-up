import * as vscode from "vscode";
import { FormatConfig } from "./model/comment-block-config";
import { DefaultStyle } from "./styles/default-style";
import { JSDocCommentBlockFormatter } from "./styles/js-doc-comment-block-formatter";
import { InlineCommentFormatter } from "./styles/inline-comment-formatter";
import { DefaultCommentFactory } from "./comment/default-comment-factory";
import { JSDocCommentBlockParser } from "./styles/js-doc-comment-block-parser";
import { InlineCommentParser } from "./styles/inline-comment-parser";

let commentFactory: DefaultCommentFactory;

export function activate(context: vscode.ExtensionContext) {
  compose();

  let disposable = vscode.commands.registerCommand(
    "extension.tidyUpCurrentComment",
    tidyUpCurrentComment
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}

function compose(): void {
  const config = getConfig();

  const jsDocCommentBlockStyle = new DefaultStyle(
    new JSDocCommentBlockParser(),
    new JSDocCommentBlockFormatter(config)
  );

  const inlineCommentStyle = new DefaultStyle(
    new InlineCommentParser(),
    new InlineCommentFormatter(config)
  );

  commentFactory = new DefaultCommentFactory(config);
  commentFactory.register([jsDocCommentBlockStyle, inlineCommentStyle]);
}

function getConfig(): FormatConfig {
  const result = new FormatConfig();
  return result;
}

function tidyUpCurrentComment() {
  if (!vscode.window.activeTextEditor) {
    return;
  }

  const editor = vscode.window.activeTextEditor as vscode.TextEditor;
  if (!editor.selection.isEmpty) {
    return;
  }

  const document = editor.document;
  const commentBlock = commentFactory.tryCreate(
    document,
    editor,
    editor.selection.active
  );

  if (!commentBlock) {
    return;
  }

  commentBlock.tidyUp();
  commentBlock.update();
}
