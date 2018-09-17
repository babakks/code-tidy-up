import { JSDocCommentBlockFormatOptions } from "../styles/js-doc-comment-block-format-options";

export class FormatOptions {
  fixWidth: FixWidthOptions = new FixWidthOptions();
  flowerBox: FlowerBoxOptions = new FlowerBoxOptions();
  jsDocCommentBlock: JSDocCommentBlockFormatOptions = new JSDocCommentBlockFormatOptions();
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
