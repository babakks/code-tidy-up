import { EndOfLine } from "vscode";

export function fixWidth(eol: EndOfLine, text: string, width: number): string {
  let residue = text;
  let result: string = "";

  while (residue.length > width) {
    if (residue.length <= width) {
      result = result + residue;
      continue;
    }

    const lastWhitespaceIndex = residue.substring(0, width).lastIndexOf(" ");
    let breakAt: number;

    if (lastWhitespaceIndex !== -1) {
      breakAt = lastWhitespaceIndex;
    } else {
      const firstWhitespaceIndex = residue.indexOf(" ");
      breakAt =
        firstWhitespaceIndex !== -1 ? firstWhitespaceIndex : residue.length;
    }

    if (result === "") {
      result += residue.substring(0, breakAt);
    } else {
      result +=
        (result !== "" ? (eol === EndOfLine.LF ? "\n" : "\r\n") : "") +
        residue.substring(0, breakAt);
    }
    
    residue = residue.substring(breakAt + 1);
  }

  result += (eol === EndOfLine.LF ? "\n" : "\r\n") + residue;

  return result;
}
