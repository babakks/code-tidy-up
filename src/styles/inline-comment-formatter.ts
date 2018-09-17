import * as vscode from "vscode";
import {
  getEOL,
  getLinesArray,
  fixWidth,
  flowerBox
} from "../utils/text-helper";
import { Formatter } from "../model/formatter";
import {
  FormatOptions,
  FixWidthOptions,
  FlowerBoxOptions
} from "../model/format-options";
import { CommentContent } from "../model/comment-content";
import { InlineCommentFormatHints } from "./inline-comment-format-hints";

export class InlineCommentFormatter implements Formatter {
  constructor(private config: FormatOptions) {}

  fixWidth(
    content: CommentContent,
    eol: vscode.EndOfLine,
    formatConfig?: FixWidthOptions
  ): CommentContent | undefined {
    this.ensureHints(content.formatHints);

    const hints = content.formatHints as InlineCommentFormatHints;

    if (!formatConfig) {
      formatConfig = this.config.fixWidth;
    }

    const correctedWidth = formatConfig.width
      ? formatConfig.width
      : formatConfig.relative
        ? formatConfig.width
        : Math.max(formatConfig.width - hints.indent, formatConfig.minLength);

    const resultText = fixWidth(eol, content.text, correctedWidth);

    return new CommentContent(resultText, content.formatHints);
  }

  flowerBox(
    content: CommentContent,
    eol: vscode.EndOfLine,
    options?: FlowerBoxOptions
  ): CommentContent | undefined {
    if (content.text.length === 0) {
      throw new Error("There's no content to flower-box it.");
    }

    if (!options) {
      options = this.config.flowerBox;
    }

    const resultText = flowerBox(eol, content.text, options);
    if (resultText === undefined) {
      return undefined;
    }

    return new CommentContent(resultText, content.formatHints);
  }

  render(content: CommentContent, eol: vscode.EndOfLine): string | undefined {
    this.ensureHints(content.formatHints);

    const hints = content.formatHints as InlineCommentFormatHints;

    const lines = getLinesArray(eol, content.text);
    const formattedLines: string[] = [];

    const slashPrefix = "/".repeat(hints.slashes);
    const whitespacePrefix = " ".repeat(hints.indent - 3);
    const prefix = whitespacePrefix + slashPrefix + " ";

    lines.forEach(x => {
      formattedLines.push(prefix + x);
    });

    return formattedLines.join(getEOL(eol));
  }

  ensureHints(hints: any): void {
    if (!(hints instanceof InlineCommentFormatHints)) {
      throw new Error("Invalid formatting hints.");
    }
  }
}
