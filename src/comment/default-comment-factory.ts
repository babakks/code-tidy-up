import * as vscode from "vscode";
import { FormatConfig } from "../model/comment-block-config";
import { Style } from "../model/style";
import { CommentFactory } from "../model/comment-factory";
import { DefaultComment } from "./default-comment";
import { Comment } from "../model/comment";

export class DefaultCommentFactory implements CommentFactory {
  private styles: Style[] = [];

  constructor(private config: FormatConfig) {}

  register(styles: Style[]) {
    Array.prototype.push.apply(this.styles, styles);
  }

  tryCreate(
    document: vscode.TextDocument,
    editor: vscode.TextEditor,
    position: vscode.Position
  ): Comment | undefined {
    const match = this.findMatchingStyle(document, position);
    if (!match) {
      return undefined;
    }

    const content = match.style.parser.getContent(document, match.range);
    if (!content) {
      return undefined;
    }

    return new DefaultComment(
      document,
      editor,
      match.range,
      content,
      match.style.formatter,
      this.config
    );
  }

  protected findMatchingStyle(
    document: vscode.TextDocument,
    position: vscode.Position
  ): { range: vscode.Range; style: Style } | undefined {
    for (const style of this.styles) {
      const range = style.parser.findRange(document, position);
      if (range) {
        return { range: range, style: style };
      }
    }
    return undefined;
  }
}
