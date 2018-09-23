import { JSDocCommentBlockFormatOptions } from "../styles/js-doc-comment-block-format-options";
import { InlineCommentFormatOptions } from "../styles/inline-comment-format-options";

export class FormatOptions {
  layout = new LayoutOptions();
  fixWidth = new FixWidthOptions();
  flowerBox = new FlowerBoxOptions();
  jsDocCommentBlock = new JSDocCommentBlockFormatOptions();
  inlineComment = new InlineCommentFormatOptions();
}

export class FixWidthOptions {
  width = 80;
  relative = false;
  minLength = 30;
}

export class FlowerBoxOptions {
  padding = [0, 1, 0, 1];
  edgeWidth = [1, 2, 1, 2];
  edgeChar = "*";
}

export class LayoutOptions {
  minSpaceBetweenParagraphs = 0;
}
