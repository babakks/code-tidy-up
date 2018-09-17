import { Parser } from "./parser";
import { Formatter } from "./formatter";

export interface Style {
  readonly name: string;
  readonly title: string;
  parser: Parser;
  formatter: Formatter;
}
