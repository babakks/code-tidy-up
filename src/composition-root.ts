import { DefaultStyle } from "./styles/default-style";
import { JSDocCommentBlockFormatter } from "./styles/js-doc-comment-block-formatter";
import { InlineCommentFormatter } from "./styles/inline-comment-formatter";
import { DefaultCommentFactory } from "./comment/default-comment-factory";
import { JSDocCommentBlockParser } from "./styles/js-doc-comment-block-parser";
import { InlineCommentParser } from "./styles/inline-comment-parser";
import { getOptions } from "./utils/config";
import { PlainParser } from "./styles/plain-parser";
import { PlainFormatter } from "./styles/plain-formatter";

export let commentFactory: DefaultCommentFactory;

export function compose(): void {
  const options = getOptions();

  const plainStyle = new DefaultStyle(
    "plain",
    "Plain",
    new PlainParser(),
    new PlainFormatter(options)
  );

  const jsDocCommentBlockStyle = new DefaultStyle(
    "jsdoc",
    "JSDoc Comment Block",
    new JSDocCommentBlockParser(plainStyle.parser as PlainParser, options),
    new JSDocCommentBlockFormatter(
      plainStyle.formatter as PlainFormatter,
      options
    )
  );

  const inlineCommentStyle = new DefaultStyle(
    "inline",
    "Inline Comment",
    new InlineCommentParser(plainStyle.parser as PlainParser),
    new InlineCommentFormatter(plainStyle.formatter as PlainFormatter, options)
  );

  commentFactory = new DefaultCommentFactory();
  commentFactory.register([jsDocCommentBlockStyle, inlineCommentStyle]);
}
