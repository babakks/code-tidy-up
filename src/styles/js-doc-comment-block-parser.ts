import * as vscode from "vscode";
import { getLinesArray, getEOL } from "../utils/text-helper";
import { Parser } from "../model/parser";
import { CommentContent } from "../model/comment-content";
import { JSDocCommentBlockFormatHints } from "./js-doc-comment-block-format-hints";
import { FormatOptions } from "../model/format-options";

export class JSDocCommentBlockParser implements Parser {
  constructor(private config: FormatOptions) {}

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
    const jsDocKeywordRegex = /^\* \@.*/; // Checks for @keyword at the beginning.
    const lines = getLinesArray(document.eol, document.getText(range));
    const eol = getEOL(document.eol);

    let passedFirstKeyword = false;
    const text = lines
      .reduce((result, x) => {
        const text = x.trim();

        /** NOTE: Another abstraction level is required. That is, another method
         * that gets the comment block and translates it into a preformatted
         * text, just by removing comment marker symbols (// or * in JSDocs).
         * Thereafter, the control should come to the current method.
         */
        
        if (text === "/**" || text === "*/" || text === "") {
          return result;
        }

        if (jsDocKeywordRegex.test(text)) {
          if (
            this.config.jsDocCommentBlock.spaceAfterSummary &&
            !passedFirstKeyword
          ) {
            result = result.concat(eol);
          }

          passedFirstKeyword = true;
          return result.concat(eol + text.substring(1).trim());
        } else {
          return result.concat(text.substring(1));
        }
      }, "")
      .trim();

    const formatHints = this.extractFormatHints(document, range);

    return new CommentContent(text, formatHints);
  }

  extractFormatHints(
    document: vscode.TextDocument,
    range: vscode.Range
  ): JSDocCommentBlockFormatHints {
    const result = new JSDocCommentBlockFormatHints();

    result.indent =
      3 + document.lineAt(range.start.line).firstNonWhitespaceCharacterIndex;

    return result;
  }
}

enum SearchDirection {
  Up,
  Down
}
