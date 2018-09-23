import * as vscode from "vscode";
import { CommentContent } from "./comment-content";
import { FormatOptions } from "./format-options";

export interface Formatter {
  fixWidth(
    content: CommentContent,
    eol: vscode.EndOfLine,
    options?: FormatOptions
  ): CommentContent | undefined;

  flowerBox(
    content: CommentContent,
    eol: vscode.EndOfLine,
    options?: FormatOptions
  ): CommentContent | undefined;

  render(
    content: CommentContent,
    eol: vscode.EndOfLine,
    options?: FormatOptions
  ): string | undefined;
}
