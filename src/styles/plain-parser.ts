import * as vscode from "vscode";
import { Parser } from "../model/parser";
import { CommentContent } from "../model/comment-content";
import { extractContent } from "../utils/text-helper";

export class PlainParser implements Parser {
  findRange(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.Range | undefined {
    return new vscode.Range(
      document.lineAt(0).range.start,
      document.lineAt(document.lineCount - 1).range.end
    );
  }

  getContent(
    document: vscode.TextDocument,
    range: vscode.Range
  ): CommentContent | undefined {
    return extractContent(document.eol, document.getText(range));
  }

  getContentFromPlainText(
    plainText: string,
    eol: vscode.EndOfLine
  ): CommentContent | undefined {
    return extractContent(eol, plainText);
  }
}
