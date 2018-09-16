import * as vscode from "vscode";
import { CommentContent } from "./comment-content";

export interface Formatter {
  fixWidth(
    content: CommentContent,
    eol: vscode.EndOfLine,
    width?: number
  ): CommentContent | undefined;

  render(content: CommentContent, eol: vscode.EndOfLine): string | undefined;
}
