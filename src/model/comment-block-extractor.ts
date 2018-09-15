import * as vscode from "vscode";
import { CommentBlock } from "./comment-block";
import { CommentBlockFactory } from "./comment-block-factory";

export class CommentBlockExtractor {
  private factories: CommentBlockFactory[] = [];

  register(factory: CommentBlockFactory): void {
    this.factories.push(factory);
  }

  extract(
    document: vscode.TextDocument,
    editor: vscode.TextEditor,
    position: vscode.Position
  ): CommentBlock | undefined {
    for (const factory of this.factories) {
      const commentBlock = factory.tryCreate(document, editor, position);
      if (commentBlock) {
        return commentBlock;
      }
    }

    return undefined;
  }
}
