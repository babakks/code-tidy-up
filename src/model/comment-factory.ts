import * as vscode from "vscode";
import { Comment } from "./comment";
export interface CommentFactory {
  tryCreate(
    document: vscode.TextDocument,
    editor: vscode.TextEditor,
    position: vscode.Position
  ): Comment | undefined;
}
