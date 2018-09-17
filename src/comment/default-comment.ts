import * as vscode from "vscode";
import { Formatter } from "../model/formatter";
import { CommentContent } from "../model/comment-content";
import { Comment } from "../model/comment";

export class DefaultComment implements Comment {
  constructor(
    private document: vscode.TextDocument,
    private editor: vscode.TextEditor,
    public readonly range: vscode.Range,
    public content: CommentContent,
    public formatter: Formatter
  ) {}

  tidyUp(): void {
    this.fixWidth();
  }

  flowerBox(): void {
    this.fixWidth();

    const newContent = this.formatter.flowerBox(
      this.content,
      this.document.eol
    );

    if (!newContent) {
      throw new Error("Formatter's flowerBox method failed.");
    }

    this.content = newContent;
  }

  fixWidth(): void {
    const newContent = this.formatter.fixWidth(this.content, this.document.eol);

    if (!newContent) {
      throw new Error("Formatter's fixWidth method failed.");
    }

    this.content = newContent;
  }

  update(): void {
    const renderedText = this.formatter.render(this.content, this.document.eol);
    if (renderedText === undefined) {
      throw new Error("Formatter's render method failed.");
    }

    this.editor.edit(builder => {
      builder.replace(this.range, renderedText);
      return true;
    });
  }
}
