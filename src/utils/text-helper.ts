import { EndOfLine } from "vscode";

export function fixWidth(
  eolType: EndOfLine,
  text: string,
  width: number
): string {
  let residue = text;
  let result: string = "";

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

    result +=
      (result !== "" ? getEOL(eolType) : "") + residue.substring(0, breakAt);

    residue = residue.substring(breakAt + 1);
  }

  result += getEOL(eolType) + residue;

  return result;
}

export function getLinesArray(eolType: EndOfLine, text: string): string[] {
  return text.split(getEOL(eolType)).map(x => x.trim());
}

export function getEOL(eolType: EndOfLine): string {
  return eolType === EndOfLine.LF ? "\n" : "\r\n";
}
