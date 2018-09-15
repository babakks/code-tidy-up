import * as vscode from "vscode";
import { CommentBlock } from "../model/comment-block";
import { CommentBlockConfig } from "../model/comment-block-config";
import { JSDocFormatParser } from "./js-doc-format-parser";
import { fixWidth } from "../utils/text-helper";

export class JSDocCommentBlock implements CommentBlock {
  private indent: number = 0;
  private content: string = "";

  constructor(
    private document: vscode.TextDocument,
    private editor: vscode.TextEditor,
    public readonly range: vscode.Range,
    private parser: JSDocFormatParser,
    private config: CommentBlockConfig
  ) {}

  tidyUp(): void {
    const content = this.parser.getCommentContent(this.document, this.range);
    const indent = this.parser.getCommentIndentation(this.document, this.range);

    const width = this.config.tidyRelativeWidth
      ? this.config.tidyWidth
      : Math.max(
          this.config.tidyWidth - indent,
          this.config.tidyMinPossibleLength
        );

    this.content = fixWidth(this.document.eol, content, width);
    this.indent = indent;
  }

  apply(): void {
    const newContent = this.parser.formatContent(
      this.document.eol,
      this.content,
      this.indent
    );

    this.editor.edit(builder => {
      builder.replace(this.range, newContent);
      return true;
    });
  }
}
