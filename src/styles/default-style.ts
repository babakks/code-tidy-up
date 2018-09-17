import { Style } from "../model/style";
import { Formatter } from "../model/formatter";
import { Parser } from "../model/parser";

export class DefaultStyle implements Style {
  constructor(public parser: Parser, public formatter: Formatter) {}
}
