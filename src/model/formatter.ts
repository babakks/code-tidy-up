import * as vscode from "vscode";
import { CommentContent } from "./comment-content";
import { FixWidthOptions, FlowerBoxOptions } from "./format-options";

export interface Formatter {
  fixWidth(
    content: CommentContent,
    eol: vscode.EndOfLine,
    options?: FixWidthOptions
  ): CommentContent | undefined;

  flowerBox(
    content: CommentContent,
    eol: vscode.EndOfLine,
    options?: FlowerBoxOptions
  ): CommentContent | undefined;

  render(content: CommentContent, eol: vscode.EndOfLine): string | undefined;
}
