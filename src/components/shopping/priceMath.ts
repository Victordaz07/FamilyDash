import { ShoppingItem, UnitKey } from "../../types/shopping";

export function unitMultiplier(unit: UnitKey, packSize?: number | null): number {
  switch (unit) {
    case "u": return 1;
    case "dozen": return 12;
    case "half_dozen": return 6;
    case "pack_4": return 4;
    case "pack_6": return 6;
    case "pack_12": return 12;
    case "pack": return packSize || 1;
    case "lb": return 1;
    case "kg": return 2.20462; // kg to lb
    case "g": return 0.00220462; // g to lb
    case "L": return 1;
    case "mL": return 0.001; // mL to L
    default: return 1;
  }
}

export function isWeight(unit: UnitKey): boolean {
  return ["lb", "kg", "g"].includes(unit);
}

export function isVolume(unit: UnitKey): boolean {
  return ["L", "mL"].includes(unit);
}

export function displayUnitLabel(unit: UnitKey, packSize?: number | null): string {
  switch (unit) {
    case "u": return "unit";
    case "dozen": return "dozen";
    case "half_dozen": return "half dozen";
    case "pack_4": return "pack of 4";
    case "pack_6": return "pack of 6";
    case "pack_12": return "pack of 12";
    case "pack": return packSize ? `pack of ${packSize}` : "pack";
    case "lb": return "lb";
    case "kg": return "kg";
    case "g": return "g";
    case "L": return "L";
    case "mL": return "mL";
    default: return "unit";
  }
}

export function lineTotal(item: ShoppingItem): number {
  // Use new pricing system if available
  if (item.priceMode === "total" && item.totalPrice) {
    return item.totalPrice;
  }
  
  if (item.priceMode === "unit" && item.unitPrice) {
    return item.unitPrice * item.qty;
  }
  
  // Fallback to legacy price system
  if (item.price) {
    return item.price * item.qty;
  }
  
  return 0;
}

export function atomicUnitPrice(item: ShoppingItem): { value: number; suffix: string } {
  const total = lineTotal(item);
  const qty = item.qty || 1;
  
  if (!total || !qty) {
    return { value: 0, suffix: "" };
  }
  
  const unit = item.unit || "u";
  const packSize = item.packSize;
  
  // For packs/docenas: show price per piece (/u)
  if (["pack", "pack_4", "pack_6", "pack_12", "dozen", "half_dozen"].includes(unit)) {
    const multiplier = unitMultiplier(unit, packSize);
    const pricePerPiece = total / (qty * multiplier);
    return { value: pricePerPiece, suffix: "/u" };
  }
  
  // For weight/volume: show price per selected unit
  if (isWeight(unit)) {
    return { value: total / qty, suffix: `/${unit}` };
  }
  
  if (isVolume(unit)) {
    return { value: total / qty, suffix: `/${unit}` };
  }
  
  // For units: show price per unit
  return { value: total / qty, suffix: "/u" };
}
