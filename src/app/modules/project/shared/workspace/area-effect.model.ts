
export interface AreaEffect {
  active: boolean;
  tid: string;
}

export interface ThresholdEffect extends AreaEffect {
  invert: boolean;
  level: number;
}
