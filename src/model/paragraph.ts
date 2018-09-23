export class Paragraph {
  public formatHints: ParagraphFormatHints;

  constructor(
    public text: string,
    public formattedText: string,
    formatHints?: ParagraphFormatHints
  ) {
    this.formatHints = formatHints ? formatHints : new ParagraphFormatHints();
  }
}

export class ParagraphFormatHints {
  bottomMargin = 0;
  hangingIndent = 0;
  firstLineIndent = 0;
}
