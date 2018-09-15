import * as vscode from "vscode";
import { CommentBlockFactory } from "../model/comment-block-factory";
import { CommentBlock } from "../model/comment-block";
import { JSDocFormatParser } from "./js-doc-format-parser";
import { JSDocCommentBlock } from "./js-doc-comment-block";
import { CommentBlockConfig } from "../model/comment-block-config";

export class JSDocCommentBlockFactory implements CommentBlockFactory {
  constructor(
    private parser: JSDocFormatParser,
    private config: CommentBlockConfig
  ) {}

  tryCreate(
    document: vscode.TextDocument,
    editor: vscode.TextEditor,
    position: vscode.Position
  ): CommentBlock | undefined {
    const range = this.parser.findRange(document, editor, position);
    if (!range) {
      return undefined;
    }

    return new JSDocCommentBlock(
      document,
      editor,
      range,
      this.parser,
      this.config
    );
  }
}
