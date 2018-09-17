import * as vscode from "vscode";
import { compose, commentFactory } from "./composition-root";

export function activate(context: vscode.ExtensionContext) {
  compose();

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.tidyUpCurrentComment",
      tidyUpCurrentComment
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.flowerBoxCurrentComment",
      flowerBoxCurrentComment
    )
  );
}

export function deactivate() {}

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

function flowerBoxCurrentComment() {
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

  commentBlock.flowerBox();
  commentBlock.update();
}
