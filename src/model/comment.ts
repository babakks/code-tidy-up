import * as vscode from "vscode";
import { CommentContent } from "./comment-content";
export interface Comment {
  range: vscode.Range;
  content: CommentContent;
  tidyUp(): void;
  update(): void;
}
