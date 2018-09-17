import { DefaultStyle } from "./styles/default-style";
import { JSDocCommentBlockFormatter } from "./styles/js-doc-comment-block-formatter";
import { InlineCommentFormatter } from "./styles/inline-comment-formatter";
import { DefaultCommentFactory } from "./comment/default-comment-factory";
import { JSDocCommentBlockParser } from "./styles/js-doc-comment-block-parser";
import { InlineCommentParser } from "./styles/inline-comment-parser";
import { getConfig } from "./utils/config";

export let commentFactory: DefaultCommentFactory;

export function compose(): void {
  const config = getConfig();

  const jsDocCommentBlockStyle = new DefaultStyle(
    "jsdoc",
    "JSDoc Comment Block",
    new JSDocCommentBlockParser(config),
    new JSDocCommentBlockFormatter(config)
  );

  const inlineCommentStyle = new DefaultStyle(
    "inline",
    "Inline Comment",
    new InlineCommentParser(),
    new InlineCommentFormatter(config)
  );

  commentFactory = new DefaultCommentFactory();
  commentFactory.register([jsDocCommentBlockStyle, inlineCommentStyle]);
}
