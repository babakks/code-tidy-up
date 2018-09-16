import * as vscode from "vscode";
import { getLinesArray } from "../utils/text-helper";
import { Parser } from "../model/parser";
import { CommentContent } from "../model/comment-content";
import { JSDocCommentBlockFormatHints } from "./js-doc-comment-block-format-hints";

export class JSDocCommentBlockParser implements Parser {
  findRange(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.Range | undefined {
    const endU = this.findTrimmedLine(
      document,
      "*/",
      position,
      SearchDirection.Up
    );
    const start = this.findTrimmedLine(
      document,
      "/**",
      position,
      SearchDirection.Up
    );
    const end = this.findTrimmedLine(
      document,
      "*/",
      position,
      SearchDirection.Down
    );
    const startD = this.findTrimmedLine(
      document,
      "/**",
      position,
      SearchDirection.Down
    );

    if (!start || !end) {
      return undefined;
    }

    const noEnd = startD && startD!.lineNumber < end!.lineNumber;
    const noStart = endU && start!.lineNumber < endU!.lineNumber;

    if (noEnd || noStart) {
      return undefined;
    }

    if (
      !this.linesStartWithAsterisks(
        document,
        start!.lineNumber,
        end!.lineNumber
      )
    ) {
      return undefined;
    }

    return new vscode.Range(start!.range.start, end!.range.end);
  }

  private findTrimmedLine(
    document: vscode.TextDocument,
    text: string,
    startPosition: vscode.Position,
    direction: SearchDirection
  ): vscode.TextLine | undefined {
    const trimmedText = text.trim();
    const line0 = document.lineAt(startPosition);
    const step = direction === SearchDirection.Down ? 1 : -1;

    for (let j = 0; ; j += step) {
      const newLineNumber = j + line0.lineNumber;
      if (newLineNumber >= document.lineCount || newLineNumber < 0) {
        break;
      }

      const line = document.lineAt(newLineNumber);

      if (!line) {
        return undefined;
      }

      if (line.text.trim() === trimmedText) {
        return line;
      }
    }

    return undefined;
  }

  private linesStartWithAsterisks(
    document: vscode.TextDocument,
    start: number,
    end: number
  ): boolean {
    const endLineLength = document.lineAt(end).text.length;
    const text = document.getText(
      new vscode.Range(start, 0, end, endLineLength)
    );
    const lines = getLinesArray(document.eol, text);

    return lines.every(x => {
      const trimmed = x.trim();
      return trimmed.startsWith("*") || trimmed === "/**" || trimmed === "*/";
    });
  }

  getContent(
    document: vscode.TextDocument,
    range: vscode.Range
  ): CommentContent | undefined {
    const lines = getLinesArray(document.eol, document.getText(range));
    const text = lines
      .reduce((result, x) => {
        const text = x.trim();
        return text === "/**" || text === "*/"
          ? result
          : result.concat(text.substring(1));
      }, "")
      .trim();

    const formatHints = new JSDocCommentBlockFormatHints();
    formatHints.indent =
      3 + document.lineAt(range.start.line).firstNonWhitespaceCharacterIndex;

    return new CommentContent(text, formatHints);
  }
}

enum SearchDirection {
  Up,
  Down
}
