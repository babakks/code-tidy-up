import * as vscode from "vscode";
import { Formatter } from "../model/formatter";
import { FormatOptions } from "../model/format-options";
import { CommentContent } from "../model/comment-content";
import { fixWidth, getEOL, flowerBox } from "../utils/text-helper";

export class PlainFormatter implements Formatter {
  constructor(private options: FormatOptions) {}

  fixWidth(
    content: CommentContent,
    eol: vscode.EndOfLine,
    options?: FormatOptions
  ): CommentContent | undefined {
    if (!options) {
      options = this.options;
    }

    const resultText = content.paragraphs
      .map((x, i, a) =>
        fixWidth(
          eol,
          x.text,
          options!.fixWidth.width,
          x.formatHints.firstLineIndent,
          x.formatHints.hangingIndent
        ).concat(
          getEOL(eol).repeat(
            Math.max(
              x.formatHints.bottomMargin,
              i !== a.length - 1 ? options!.layout.minSpaceBetweenParagraphs : 0
            )
          )
        )
      )
      .join(getEOL(eol));

    return new CommentContent(
      resultText,
      content.paragraphs,
      content.formatHints
    );
  }

  flowerBox(
    content: CommentContent,
    eol: vscode.EndOfLine,
    options?: FormatOptions
  ): CommentContent | undefined {
    if (content.text.length === 0) {
      throw new Error("No content to flower-box.");
    }

    const resultText = flowerBox(
      eol,
      content.text,
      options ? options.flowerBox : this.options.flowerBox
    );

    if (resultText === undefined) {
      return undefined;
    }

    return new CommentContent(
      resultText,
      content.paragraphs,
      content.formatHints
    );
  }

  render(
    content: CommentContent,
    eol: vscode.EndOfLine,
    options?: FormatOptions
  ): string | undefined {
    return content.text;
  }
}
