// TODO Apply this data type to all margin/padding properties.
// TAG: important

export class RectangularProperty {
  value: number[];

  constructor(value: number[]) {
    if (value.length !== 4) {
      throw new Error("Invalid rectangular property value dimension.");
    }

    this.value = value;
  }

  static create(
    top: number,
    right: number,
    bottom: number,
    left: number
  ): RectangularProperty {
    return new RectangularProperty([top, right, bottom, left]);
  }

  get top(): number {
    return this.value[0];
  }

  set top(value: number) {
    this.value[0] = value;
  }

  get right(): number {
    return this.value[1];
  }

  set right(value: number) {
    this.value[1] = value;
  }

  get bottom(): number {
    return this.value[2];
  }

  set bottom(value: number) {
    this.value[2] = value;
  }

  get left(): number {
    return this.value[3];
  }

  set left(value: number) {
    this.value[3] = value;
  }
}
