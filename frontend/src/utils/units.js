// Unit conversion utilities
const CM_TO_IN = 0.393701;
const KG_TO_LB = 2.20462;
const IN_TO_CM = 2.54;
const LB_TO_KG = 0.453592;

export function cmToInches(cm) {
  return Math.round(cm * CM_TO_IN * 10) / 10;
}

export function kgToLbs(kg) {
  return Math.round(kg * KG_TO_LB * 10) / 10;
}

export function inchesToCm(inches) {
  return Math.round(inches * IN_TO_CM * 10) / 10;
}

export function lbsToKg(lbs) {
  return Math.round(lbs * LB_TO_KG * 10) / 10;
}

export function cmToFeetInches(cm) {
  const totalInches = cm * CM_TO_IN;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
}

export function formatMeasurement(valueCm, isMetric) {
  if (typeof valueCm !== 'number') return valueCm;
  if (isMetric) return `${valueCm} cm`;
  return `${cmToInches(valueCm)}"`;
}

export function formatHeight(cm, isMetric) {
  if (isMetric) return `${cm} cm`;
  return cmToFeetInches(cm);
}

export function formatWeight(kg, isMetric) {
  if (isMetric) return `${kg} kg`;
  return `${kgToLbs(kg)} lbs`;
}

export const MEASUREMENT_LABELS = {
  shoulder_width: 'Shoulder Width',
  chest_circumference: 'Chest',
  waist_circumference: 'Waist',
  hip_circumference: 'Hip',
  arm_length: 'Arm Length',
  inseam: 'Inseam',
  torso_length: 'Torso Length',
  neck_circumference: 'Neck',
  thigh_circumference: 'Thigh',
  height_cm: 'Height',
  weight_kg: 'Weight'
};
