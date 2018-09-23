import * as vscode from "vscode";
import { getEOL, getLinesArray } from "../utils/text-helper";
import { Formatter } from "../model/formatter";
import { FormatOptions } from "../model/format-options";
import { CommentContent } from "../model/comment-content";
import { JSDocCommentBlockFormatHints } from "./js-doc-comment-block-format-hints";
import { PlainFormatter } from "./plain-formatter";
import { cloneInto } from "../utils/clone-into";

export class JSDocCommentBlockFormatter implements Formatter {
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

    if (!options) {
      options = this.options;
    }

    const adjustedWidth = options.fixWidth.relative
      ? options.fixWidth.width
      : Math.max(
          options.fixWidth.width - content.formatHints.indent,
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
    //       x.formatHints.firstLineIndent,
    //       x.formatHints.hangingIndent
    //     );
    //   })
    //   .join(getEOL(eol).repeat(1 + this.options.layout.spaceBetweenParagraphs));

    // return new CommentContent(
    //   resultText,
    //   content.paragraphs,
    //   content.formatHints
    // );
  }

  flowerBox(
    content: CommentContent,
    eol: vscode.EndOfLine,
    options?: FormatOptions
  ): CommentContent | undefined {
    return this.plainFormatter.flowerBox(content, eol, options);
  }

  render(content: CommentContent, eol: vscode.EndOfLine): string | undefined {
    this.ensureHints(content.formatHints);

    const hints = content.formatHints as JSDocCommentBlockFormatHints;

    const lines = getLinesArray(eol, content.text, false);
    const formattedLines: string[] = [];
    formattedLines.push(" ".repeat(hints.indent - 3) + "/**");
    lines.forEach(x => {
      formattedLines.push(" ".repeat(hints.indent - 2) + "* " + x);
    });
    formattedLines.push(" ".repeat(hints.indent - 2) + "*/");

    return formattedLines.join(getEOL(eol));
  }

  ensureHints(hints: any): void {
    if (!(hints instanceof JSDocCommentBlockFormatHints)) {
      throw new Error("Invalid formatting hints.");
    }
  }
}
