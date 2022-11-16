
export type SquareValue = "X" | number;

export interface SquareData {
    revealed: Boolean;
    value: SquareValue;
    has_flag: Boolean;
}

export type LineData = SquareData[]

export type LayerData = LineData[]

export type LayerSetData = LayerData[]


export interface Coordinate {
    x: number;
    y: number;
    z: number;
}