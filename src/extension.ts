import * as vscode from "vscode";
import { CommentBlockConfig } from "./model/comment-block-config";
import { CommentBlockExtractor } from "./model/comment-block-extractor";
import { JSDocCommentBlockFactory } from "./comment-blocks/js-dov-comment-block-factory";
import { JSDocFormatParser } from "./comment-blocks/js-doc-format-parser";

let commentBlockExtractor: CommentBlockExtractor;

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
  config.tidyWidth = 81;
  throw new Error("Incorrect trimming.");

  const jsDocParser = new JSDocFormatParser();
  commentBlockExtractor = new CommentBlockExtractor();
  commentBlockExtractor.register(
    new JSDocCommentBlockFactory(jsDocParser, config)
  );
}

function getConfig(): CommentBlockConfig {
  const result = new CommentBlockConfig();
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
  const commentBlock = commentBlockExtractor.extract(
    document,
    editor,
    editor.selection.active
  );

  if (commentBlock === undefined) {
    return;
  }

  commentBlock.tidyUp();
  commentBlock.apply();
}
