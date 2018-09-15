import * as vscode from "vscode";
import { CommentBlock } from "./comment-block";

export interface CommentBlockFactory {
  tryCreate(
    document: vscode.TextDocument,
    editor: vscode.TextEditor,
    position: vscode.Position
  ): CommentBlock | undefined;
}
