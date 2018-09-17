import * as vscode from "vscode";
import {
  getEOL,
  getLinesArray,
  fixWidth,
  flowerBox,
  paragraphToLine
} from "../utils/text-helper";
import { Formatter } from "../model/formatter";
import {
  FormatOptions,
  FlowerBoxOptions,
  FixWidthOptions
} from "../model/format-options";
import { CommentContent } from "../model/comment-content";
import { JSDocCommentBlockFormatHints } from "./js-doc-comment-block-format-hints";
import { JSDocCommentBlockFormatOptions } from "./js-doc-comment-block-format-options";

export class JSDocCommentBlockFormatter implements Formatter {
  constructor(private options: FormatOptions) {}

  fixWidth(
    content: CommentContent,
    eol: vscode.EndOfLine,
    options?: FixWidthOptions
  ): CommentContent | undefined {
    this.ensureHints(content.formatHints);

    if (!options) {
      options = this.options.fixWidth;
    }

    const correctedWidth = options.relative
      ? options.width
      : Math.max(options.width - content.formatHints.indent, options.minLength);

    const paragraphs = paragraphToLine(eol, content.text);

    paragraphs.forEach(x => {
      const resultText = fixWidth(eol, x, correctedWidth);
    });

    if (this.options.jsDocCommentBlock.indentWrappedText) {
      resultText = this.indentWrappedText(
        resultText,
        eol,
        content.formatHints,
        options
      );
    }

    return new CommentContent(resultText, content.formatHints);
  }

  indentWrappedText(
    text: string,
    eol: vscode.EndOfLine,
    formatHints: JSDocCommentBlockFormatHints,
    options: FixWidthOptions
  ): string {
    /**
     * To indent wrapped lines, we have to extract every single wrapped
     * paragraph and adjust their width.
     */

    const correctedWidth = Math.max(
      options.width -
        formatHints.indent -
        this.options.jsDocCommentBlock.wrappedTextIndentation,
      options.minLength
    );

    const lines = getLinesArray(eol, text);
    const jsDocKeywordRegex = /^\@.*/;

    let wrappedLines: string[] = [];
    let resultLines: string[] = [];
    let passedFirstKeyword = false;

    // Adding a dummy keyword line at the end of the lines array to enforce the
    // up coming algorithm to flush the ending lines into the results.
    lines.push("@dummy");

    for (let j = 0; j < lines.length; j++) {
      const line = lines[j];
      const startWithKeyword = jsDocKeywordRegex.test(line);

      if (!startWithKeyword) {
        if (passedFirstKeyword) {
          // Should accumulate coming lines.
          wrappedLines.push(line);
        } else {
          // Yet to encounter a keyword, so pushing into the results.
          resultLines.push(line);
        }
      } else {
        if (passedFirstKeyword) {
          // Another keyword encountered, so flushing whatever taken after
          // fixing their width to the new value.
          const subparagraph = wrappedLines.join(getEOL(eol));
          const fixedSubparagraph = fixWidth(eol, subparagraph, correctedWidth);

          Array.prototype.push.apply(
            resultLines,
            getLinesArray(eol, fixedSubparagraph).map(
              x =>
                " ".repeat(
                  this.options.jsDocCommentBlock.wrappedTextIndentation
                ) + x
            )
          );

          // Re-accumulating.
          wrappedLines = [];
        } else {
          // First keyword encounter.
          passedFirstKeyword = true;
        }

        resultLines.push(line);
      }
    }

    resultLines.pop(); // Taking out the "@dummy" line.

    return resultLines.join(getEOL(eol));
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
      options = this.options.flowerBox;
    }

    const resultText = flowerBox(eol, content.text, options);
    if (resultText === undefined) {
      return undefined;
    }

    return new CommentContent(resultText, content.formatHints);
  }

  render(content: CommentContent, eol: vscode.EndOfLine): string | undefined {
    this.ensureHints(content.formatHints);

    const lines = getLinesArray(eol, content.text, false);
    const formattedLines: string[] = [];
    formattedLines.push(" ".repeat(content.formatHints.indent - 3) + "/**");
    lines.forEach(x => {
      formattedLines.push(
        " ".repeat(content.formatHints.indent - 2) + "* " + x
      );
    });
    formattedLines.push(" ".repeat(content.formatHints.indent - 2) + "*/");

    return formattedLines.join(getEOL(eol));
  }

  ensureHints(hints: any): void {
    if (!(hints instanceof JSDocCommentBlockFormatHints)) {
      throw new Error("Invalid formatting hints.");
    }
  }
}
