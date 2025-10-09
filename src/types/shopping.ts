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
  unit?: string;              // u, kg, L, pack
  category?: string;          // frutas, lácteos…
  note?: string;
  price?: number;             // por unidad
  status: ShoppingStatus;
  storeId?: string;           // asignada a una tienda
  createdAt?: any;
  updatedAt?: any;
};

export type ShoppingList = {
  id?: string;
  familyId: string;
  taskId: string;             // SIEMPRE ligada a una Task
  title: string;
  stores: ShoppingStore[];
  currency: string;           // "USD", "DOP"…
  budgetLimit?: number;       // NEW: Total budget limit for the entire list
  createdBy: string;          // userId
  createdAt?: any;
  updatedAt?: any;
};

export type ShoppingProduct = {
  id?: string;
  familyId: string;
  barcode: string;             // EAN/UPC
  name: string;
  defaultUnit?: string;        // "u", "kg", "L"…
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

