import { Paragraph } from "./paragraph";

export class CommentContent {
  constructor(
    public text: string,
    public paragraphs: Paragraph[],
    public formatHints?: any
  ) {}
}
