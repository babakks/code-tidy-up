import * as vscode from "vscode";
import { Parser } from "../model/parser";
import { getLinesArray, getEOL } from "../utils/text-helper";
import { CommentContent } from "../model/comment-content";
import { InlineCommentFormatHints } from "./inline-comment-format-hints";
import { PlainParser } from "./plain-parser";

export class InlineCommentParser implements Parser {
  constructor(private plainParser: PlainParser) {}

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
    const contentRegex = /^\s*\/{2,}\s*([^ ]*)\s*/;
    const lines = getLinesArray(document.eol, document.getText(range));
    const plainText = lines.reduce((r, x) =>
      r.concat(
        r !== "" ? getEOL(document.eol) : "",
        x.replace(contentRegex, "$1")
      )
    );

    // Using plain text formatter to get content.
    const result = this.plainParser.getContentFromPlainText(
      plainText,
      document.eol
    );

    if (!result) {
      return undefined;
    }

    result.formatHints = this.extractFormatHints(document, range);

    return result;
  }

  extractFormatHints(
    document: vscode.TextDocument,
    range: vscode.Range
  ): InlineCommentFormatHints {
    const result = new InlineCommentFormatHints();

    const startLine = document.lineAt(range.start.line);
    result.indent = 3 + startLine.firstNonWhitespaceCharacterIndex;

    const slashesRegexResult = /^(\/{2,})[^/]*/.exec(startLine.text.trim());
    result.slashes = slashesRegexResult ? slashesRegexResult[1].length : 2;

    return result;
  }
}

enum SearchDirection {
  Up,
  Down
}
