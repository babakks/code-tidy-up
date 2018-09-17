import * as vscode from "vscode";
import { Parser } from "../model/parser";
import { getLinesArray } from "../utils/text-helper";
import { CommentContent } from "../model/comment-content";
import { InlineCommentFormatHints } from "./inline-comment-format-hints";

export class InlineCommentParser implements Parser {
  findRange(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.Range | undefined {
    const start = this.findLastCommentLine(
      document,
      position,
      SearchDirection.Up
    );

    if (!start) {
      return undefined;
    }

    const end = this.findLastCommentLine(
      document,
      position,
      SearchDirection.Down
    );

    if (!end) {
      return undefined;
    }

    return new vscode.Range(start!.range.start, end!.range.end);
  }

  private findLastCommentLine(
    document: vscode.TextDocument,
    startPosition: vscode.Position,
    direction: SearchDirection
  ): vscode.TextLine | undefined {
    const line0 = document.lineAt(startPosition);
    const step = direction === SearchDirection.Down ? 1 : -1;
    let lastLine: vscode.TextLine | undefined = undefined;

    for (let j = 0; ; j += step) {
      const newLineNumber = j + line0.lineNumber;
      const outOfRange =
        newLineNumber >= document.lineCount || newLineNumber < 0;

      if (outOfRange) {
        break;
      }

      const line = document.lineAt(newLineNumber);
      const regex = /^\s*\/{2,}/;
      if (!regex.test(line.text)) {
        break;
      }

      lastLine = line;
    }

    return lastLine;
  }

  getContent(
    document: vscode.TextDocument,
    range: vscode.Range
  ): CommentContent | undefined {
    const regex = /^\s*\/{2,}\s*([^ ]*)\s*/;
    const lines = getLinesArray(document.eol, document.getText(range));

    const text = lines.reduce((result, x) => {
      const text = x.replace(regex, "$1");
      return result.concat(result !== "" ? " " + text : text);
    }, "");

    const formatHints = new InlineCommentFormatHints();
    formatHints.indent =
      3 + document.lineAt(range.start.line).firstNonWhitespaceCharacterIndex;

    return new CommentContent(text, formatHints);
  }
}

enum SearchDirection {
  Up,
  Down
}
