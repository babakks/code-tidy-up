import { EndOfLine } from "vscode";
import { FlowerBoxOptions } from "../model/format-options";

export function fixWidth(
  eolType: EndOfLine,
  text: string,
  width: number
): string {
  let residue = text.trim();
  let result: string = "";
  const eol = getEOL(eolType);

  while (residue.length > width) {
    if (residue.length <= width) {
      result = result + residue;
      continue;
    }

    const lastWhitespaceIndex = residue
      .substring(0, width + 1)
      .lastIndexOf(" ");
    let breakAt: number;

    if (lastWhitespaceIndex !== -1) {
      breakAt = lastWhitespaceIndex;
    } else {
      const firstWhitespaceIndex = residue.indexOf(" ");
      breakAt =
        firstWhitespaceIndex !== -1 ? firstWhitespaceIndex : residue.length;
    }

    result += (result !== "" ? eol : "") + residue.substring(0, breakAt);

    residue = residue.substring(breakAt + 1);
  }

  result += (result !== "" ? getEOL(eolType) : "") + residue;

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

export function paragraphToLine(eolType: EndOfLine, text: string): string[] {
  const lines = getLinesArray(eolType, text);
  const eol = getEOL(eolType);
  return lines
    .map(x => x + (x === "" ? eol : " "))
    .join("")
    .split(eol)
    .map(x => x.trim());
}

export function getEOL(eolType: EndOfLine): string {
  return eolType === EndOfLine.LF ? "\n" : "\r\n";
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
