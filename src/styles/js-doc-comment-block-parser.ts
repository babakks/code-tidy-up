import * as vscode from "vscode";
import { getLinesArray, getEOL } from "../utils/text-helper";
import { Parser } from "../model/parser";
import { CommentContent } from "../model/comment-content";
import { JSDocCommentBlockFormatHints } from "./js-doc-comment-block-format-hints";
import { FormatOptions } from "../model/format-options";
import { Paragraph } from "../model/paragraph";
import { PlainParser } from "./plain-parser";

export class JSDocCommentBlockParser implements Parser {
  constructor(
    private plainParser: PlainParser,
    private options: FormatOptions
  ) {}

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
    const jsDocKeywordRegex = /^\@.*/; // Checks for @keyword at the beginning.
    const asterisksRemovalRegex = /^\*\s*(.*)/;
    const lines = getLinesArray(document.eol, document.getText(range));
    const eol = getEOL(document.eol);

    const plainText = lines.reduce((r, x) => {
      const text = x.trim();

      if (text === "/**" || text === "*/") {
        return r;
      }

      const textWithoutBeginningAsterisks = text.replace(
        asterisksRemovalRegex,
        "$1"
      );

      if (textWithoutBeginningAsterisks === "") {
        // This is a blank line. So, inserting a new line, if not at the first
        // of the comment.
        return r === ""
          ? ""
          : r.endsWith(eol + eol)
            ? r.concat(eol)
            : r.concat(eol + eol);
      }

      if (jsDocKeywordRegex.test(textWithoutBeginningAsterisks)) {
        // This is a line that starts with a JSDoc keyword (e.g., @param). So,
        // inserting a new line, if not at the first of the comment.

        r = r.concat(r.endsWith(eol + eol) ? "" : eol + eol);
      }

      return r.concat(
        r === "" || r.endsWith(eol) ? "" : " ",
        textWithoutBeginningAsterisks
      );
    }, "");

    // Using plain text formatter to get content.
    const result = this.plainParser.getContentFromPlainText(
      plainText,
      document.eol
    );

    if (!result) {
      return undefined;
    }

    this.updateFormatHints(document, range, result);

    return result;
  }

  updateFormatHints(
    document: vscode.TextDocument,
    range: vscode.Range,
    content: CommentContent
  ): void {
    content.formatHints = new JSDocCommentBlockFormatHints();
    const hints = content.formatHints as JSDocCommentBlockFormatHints;

    this.setCommentIndentationFormatHints(document, range, hints);
    this.setParagraphHints(content);
  }

  private setCommentIndentationFormatHints(
    document: vscode.TextDocument,
    range: vscode.Range,
    result: JSDocCommentBlockFormatHints
  ) {
    result.indent =
      3 + document.lineAt(range.start.line).firstNonWhitespaceCharacterIndex;
  }

  setParagraphHints(content: CommentContent): any {
    this.removeSpaceAfterParagraphs(content);
    this.setSpaceAfterSummaryFormatHints(content);
    this.setKeywordHangingIndentationFormatHints(content);
  }

  private setSpaceAfterSummaryFormatHints(content: CommentContent) {
    if (0 < this.options.jsDocCommentBlock.spaceAfterSummary) {
      const firstKeywordParagraphIndexAfterSummary = this.getFirstParagraphIndexStartedWithKeyword(
        content.paragraphs,
        0,
        ["summary"]
      );
      if (0 < firstKeywordParagraphIndexAfterSummary) {
        content.paragraphs[
          -1 + firstKeywordParagraphIndexAfterSummary
        ].formatHints.bottomMargin = this.options.jsDocCommentBlock.spaceAfterSummary;
      }
    }
  }

  private removeSpaceAfterParagraphs(content: CommentContent) {
    content.paragraphs.forEach(x => {
      x.formatHints.bottomMargin = 0;
    });
  }

  private setKeywordHangingIndentationFormatHints(content: CommentContent) {
    if (0 < this.options.jsDocCommentBlock.keywordHangingIndentation) {
      content.paragraphs.forEach(x => {
        if (this.beginsWithKeyword(x.text)) {
          x.formatHints.hangingIndent = this.options.jsDocCommentBlock.keywordHangingIndentation;
        }
      });
    }
  }

  getFirstParagraphIndexStartedWithKeyword(
    paragraphs: Paragraph[],
    start: number = 0,
    ignoreKeywords: string[] = []
  ): number {
    return paragraphs.findIndex((x, i) => {
      if (i < start) {
        return false;
      }

      const keyword = this.getBeginningKeyword(x.text);
      return keyword !== undefined && ignoreKeywords.indexOf(keyword) === -1;
    });
  }

  beginsWithKeyword(text: string, keyword?: string): boolean {
    const beginningKeyword = this.getBeginningKeyword(text);

    return (
      beginningKeyword !== undefined &&
      (!keyword || beginningKeyword === keyword)
    );
  }

  getBeginningKeyword(text: string): string | undefined {
    const regex = /^\@([^ ]*).*/;
    const captures = regex.exec(text);
    return !captures ? undefined : captures[1];
  }
}
enum SearchDirection {
  Up,
  Down
}
