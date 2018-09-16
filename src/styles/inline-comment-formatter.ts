import * as vscode from "vscode";
import { getEOL, getLinesArray, fixWidth } from "../utils/text-helper";
import { Formatter } from "../model/formatter";
import { FormatConfig } from "../model/comment-block-config";
import { CommentContent } from "../model/comment-content";
import { InlineCommentFormatHints } from "./inline-comment-format-hints";

export class InlineCommentFormatter implements Formatter {
  constructor(private config: FormatConfig) {}

  fixWidth(
    content: CommentContent,
    eol: vscode.EndOfLine,
    width?: number
  ): CommentContent | undefined {
    this.ensureHints(content.formatHints);

    const correctedWidth = width
      ? width
      : this.config.tidyRelativeWidth
        ? this.config.tidyWidth
        : Math.max(
            this.config.tidyWidth - content.formatHints.indent,
            this.config.tidyMinPossibleLength
          );

    const resultText = fixWidth(eol, content.text, correctedWidth);

    return new CommentContent(resultText, content.formatHints);
  }

  render(content: CommentContent, eol: vscode.EndOfLine): string | undefined {
    this.ensureHints(content.formatHints);

    const lines = getLinesArray(eol, content.text);
    const formattedLines: string[] = [];
    lines.forEach(x => {
      formattedLines.push(
        " ".repeat(content.formatHints.indent - 3) + "// " + x
      );
    });

    return formattedLines.join(getEOL(eol));
  }

  ensureHints(hints: any): void {
    if (!(hints instanceof InlineCommentFormatHints)) {
      throw new Error("Invalid formatting hints.");
    }
  }
}
