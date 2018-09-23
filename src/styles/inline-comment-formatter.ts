import * as vscode from "vscode";
import { getEOL, getLinesArray } from "../utils/text-helper";
import { Formatter } from "../model/formatter";
import { FormatOptions } from "../model/format-options";
import { CommentContent } from "../model/comment-content";
import { InlineCommentFormatHints } from "./inline-comment-format-hints";
import { cloneInto } from "../utils/clone-into";
import { PlainFormatter } from "./plain-formatter";

export class InlineCommentFormatter implements Formatter {
  constructor(
    private plainFormatter: PlainFormatter,
    private options: FormatOptions
  ) {}

  fixWidth(
    content: CommentContent,
    eol: vscode.EndOfLine,
    options?: FormatOptions
  ): CommentContent | undefined {
    this.ensureHints(content.formatHints);

    const hints = content.formatHints as InlineCommentFormatHints;

    if (!options) {
      options = this.options;
    }

    const adjustedWidth = options.fixWidth.width
      ? options.fixWidth.width
      : options.fixWidth.relative
        ? options.fixWidth.width
        : Math.max(
            options.fixWidth.width - hints.indent,
            options.fixWidth.minLength
          );

    let overrideOptions = new FormatOptions();
    cloneInto(options, overrideOptions);
    overrideOptions.fixWidth.width = adjustedWidth;

    return this.plainFormatter.fixWidth(content, eol, overrideOptions);

    // const resultText = content.paragraphs
    //   .map(x => {
    //     const correctedWidth =
    //       adjustedWidth -
    //       x.formatHints.padding.left -
    //       x.formatHints.padding.right;

    //     return fixWidth(
    //       eol,
    //       x.rawContent,
    //       correctedWidth,
    //       this.options.inlineComment.firstLineIndentation,
    //       this.options.inlineComment.hanging
    //     )
    //       .split(getEOL(eol))
    //       .map(x => " ".repeat());
    //   })
    //   .join(getEOL(eol).repeat(1 + this.options.layout.spaceBetweenParagraphs));
  }

  flowerBox(
    content: CommentContent,
    eol: vscode.EndOfLine,
    options?: FormatOptions
  ): CommentContent | undefined {
    return this.plainFormatter.flowerBox(content, eol, options);
  }

  render(
    content: CommentContent,
    eol: vscode.EndOfLine,
    options?: FormatOptions
  ): string | undefined {
    this.ensureHints(content.formatHints);

    const hints = content.formatHints as InlineCommentFormatHints;

    const lines = getLinesArray(eol, content.text, false);
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
