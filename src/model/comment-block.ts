import * as vscode from "vscode";

export interface CommentBlock {
  readonly range: vscode.Range;
  tidyUp(): void;
  apply(): void;
}
