import { Parser } from "./parser";
import { Formatter } from "./formatter";

export interface Style {
  parser: Parser;
  formatter: Formatter;
}
