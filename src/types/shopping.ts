export type PriceMode = "unit" | "total";
export type UnitKey = "u" | "dozen" | "half_dozen" | "pack" | "pack_4" | "pack_6" | "pack_12" | "lb" | "kg" | "g" | "L" | "mL";
export type ShoppingStatus = "pending" | "in_cart" | "purchased";

export type ShoppingStore = {
  id: string;                 // uid interno
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  color?: string;             // chip color opcional
  isFavorite?: boolean;
  budgetLimit?: number;       // presupuesto de la tienda (en la moneda de la lista)
};

export type ShoppingItem = {
  id: string;
  name: string;
  qty: number;
  unit?: UnitKey;             // u, dozen, half_dozen, pack, pack_4, pack_6, pack_12, lb, kg, g, L, mL
  packSize?: number | null;   // para unit="pack"
  category?: string;          // frutas, lácteos…
  note?: string;
  status: ShoppingStatus;
  storeId?: string;           // asignada a una tienda
  createdAt?: any;
  updatedAt?: any;
  // pricing:
  priceMode?: PriceMode;      // "unit" | "total"
  unitPrice?: number | null;  // precio por unidad (lb, kg, u, etc.)
  totalPrice?: number | null; // precio total del item
  price?: number;             // LEGACY - para compatibilidad
};

export type ShoppingList = {
  id?: string;
  familyId: string;
  taskId: string;             // SIEMPRE ligada a una Task
  title: string;
  stores: ShoppingStore[];
  currency: string;           // "USD", "DOP"…
  createdBy: string;          // userId
  createdAt?: any;
  updatedAt?: any;
};

export type ShoppingProduct = {
  id?: string;
  familyId: string;
  barcode: string;             // EAN/UPC
  name: string;
  defaultUnit?: UnitKey;       // "u", "kg", "L"…
  lastPrice?: number;          // último precio visto
  lastStoreId?: string;
  updatedAt?: any;
  createdAt?: any;
};

export type ShoppingHistory = {
  id?: string;
  familyId: string;
  taskId: string;
  listTitle: string;
  storeName?: string;
  estimatedTotal: number;      // Total estimado de la lista
  actualTotal: number;         // Total real pagado
  taxes: number;               // Impuestos pagados
  currency: string;
  items: ShoppingItem[];       // Items que se compraron
  completedAt: any;            // Timestamp de cuando se completó
  completedBy: string;         // userId que completó la compra
  notes?: string;              // Notas adicionales sobre la compra
};

export type PriceObservation = {
  id?: string;
  familyId: string;
  barcode: string;
  storeId?: string;
  unitPrice?: number;
  totalPrice?: number;
  currency: string;
  userId: string;
  qty?: number;
  unit?: UnitKey;
  observedAt: any;
};

