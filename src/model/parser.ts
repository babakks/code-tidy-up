import * as vscode from "vscode";
import { CommentContent } from "./comment-content";

export interface Parser {
  findRange(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.Range | undefined;

  getContent(
    document: vscode.TextDocument,
    range: vscode.Range
  ): CommentContent | undefined;
}
