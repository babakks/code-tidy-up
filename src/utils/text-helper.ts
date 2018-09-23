import { EndOfLine } from "vscode";
import { FlowerBoxOptions } from "../model/format-options";
import { Paragraph } from "../model/paragraph";
import { CommentContent } from "../model/comment-content";

export function fixWidth(
  eolType: EndOfLine,
  text: string,
  width: number,
  firstLineIndent: number,
  hangingIndent: number
): string {
  const eol = getEOL(eolType);
  let residue = text.trim();
  let result: string = "";
  let count = 0;

  while (true) {
    const referenceIndent = count === 0 ? firstLineIndent : hangingIndent;
    const referenceWidth = width - referenceIndent;
    const newLinePrefix = " ".repeat(referenceIndent);

    const lastWhitespaceIndex =
      residue.length > referenceWidth
        ? residue.substring(0, referenceWidth + 1).lastIndexOf(" ")
        : residue.length;
    let breakAt: number;

    if (lastWhitespaceIndex !== -1) {
      breakAt = lastWhitespaceIndex;
    } else {
      const firstWhitespaceIndex = residue.indexOf(" ");
      breakAt =
        firstWhitespaceIndex !== -1 ? firstWhitespaceIndex : residue.length;
    }

    result = result.concat(
      result !== "" ? eol : "",
      newLinePrefix,
      residue.substring(0, breakAt)
    );

    residue = residue.substring(breakAt + 1);
    count++;

    if (residue.length === 0) {
      break;
    }
  }

  return result;
}

export function getLinesArray(
  eolType: EndOfLine,
  text: string,
  trimLines: boolean = true
): string[] {
  const lines = text.split(getEOL(eolType));
  return !trimLines ? lines : lines.map(x => x.trim());
}

// export function paragraphToLine(eolType: EndOfLine, text: string): string[] {
//   const lines = getLinesArray(eolType, text);
//   const eol = getEOL(eolType);
//   return lines
//     .map(x => x + (x === "" ? eol : " "))
//     .join("")-nv
//     .split(eol)
//     .map(x => x.trim());
// }

export function getEOL(eolType: EndOfLine): string {
  return eolType === EndOfLine.LF ? "\n" : "\r\n";
}

export function extractContent(
  eolType: EndOfLine,
  text: string
): CommentContent {
  const eol = getEOL(eolType);
  const lines = text.split(eol).map(x => x.trim());

  const flatParagraphText = lines.reduce(
    (r, x) =>
      x === ""
        ? r.concat(r !== "" ? eol : "") // A blank line, which separates two paragraphs.
        : r.concat(r !== "" && !r.endsWith(eol) ? " " : "", x),
    ""
  );

  const flatParagraphLines = flatParagraphText.split(eol);

  // Removing blank lines and turning them into paragraph format hints (bottom
  // margin).
  const nonEmptyLineIndices = flatParagraphLines
    .map((x, i) => (x !== "" ? i : -1))
    .filter(x => x !== -1);

  if (0 === nonEmptyLineIndices.length) {
    return new CommentContent("", []);
  }

  const paragraphs = nonEmptyLineIndices.map(
    x => new Paragraph(flatParagraphLines[x], flatParagraphLines[x])
  );

  // Setting bottom margins.
  nonEmptyLineIndices.forEach((x, i, a) => {
    paragraphs[i].formatHints.bottomMargin =
      i + 1 < a.length ? a[i + 1] - a[i] : 0;
  });

  const resultText = paragraphs.reduce(
    (r, x) => r.concat(r !== "" ? eol : "", x.text),
    ""
  );

  return new CommentContent(resultText, paragraphs);
}

export function getMaxLineLength(
  eolType: EndOfLine,
  text: string
): number | undefined {
  const lines = getLinesArray(eolType, text);
  if (!lines) {
    return undefined;
  }

  return lines.reduce((result, x) => {
    return x.length > result ? x.length : result;
  }, 0);
}

export function flowerBox(
  eolType: EndOfLine,
  text: string,
  options: FlowerBoxOptions
): string | undefined {
  const maxLength = getMaxLineLength(eolType, text);
  if (maxLength === undefined) {
    return undefined;
  }

  const horizontalEdgeLength =
    options.edgeWidth[3] +
    options.padding[3] +
    maxLength +
    options.padding[1] +
    options.edgeWidth[1];

  const horizontalEdgeBlock = options.edgeChar.repeat(horizontalEdgeLength);
  const leftEdgeBlock: string = options.edgeChar.repeat(options.edgeWidth[3]);
  const rightEdgeBlock: string = options.edgeChar.repeat(options.edgeWidth[1]);

  const resultLines: string[] = [];
  const lines = getLinesArray(eolType, text);

  Array.prototype.push.apply(
    resultLines,
    [horizontalEdgeBlock].copyWithin(0, 0, -1 + options.edgeWidth[0])
  );

  Array.prototype.push.apply(
    resultLines,
    [
      leftEdgeBlock +
        " ".repeat(
          horizontalEdgeLength - leftEdgeBlock.length - rightEdgeBlock.length
        ) +
        rightEdgeBlock
    ].copyWithin(0, 0, -1 + options.padding[0])
  );

  Array.prototype.push.apply(
    resultLines,
    lines.map(
      x =>
        leftEdgeBlock +
        " ".repeat(options.padding[3]) +
        x +
        " ".repeat(maxLength - x.length) +
        " ".repeat(options.padding[1]) +
        rightEdgeBlock
    )
  );

  Array.prototype.push.apply(
    resultLines,
    [
      leftEdgeBlock +
        " ".repeat(
          horizontalEdgeLength - leftEdgeBlock.length - rightEdgeBlock.length
        ) +
        rightEdgeBlock
    ].copyWithin(0, 0, -1 + options.padding[2])
  );

  Array.prototype.push.apply(
    resultLines,
    [horizontalEdgeBlock].copyWithin(0, 0, -1 + options.edgeWidth[2])
  );

  return resultLines.join(getEOL(eolType));
}
