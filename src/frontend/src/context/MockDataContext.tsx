import { type ReactNode, createContext, useContext } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Part {
  id: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  unitCost: number;
  unitPrice: number;
  uom: string;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  reorderQty: number;
  totalStock: number;
  status: "active" | "inactive" | "discontinued";
  barcode: string;
  imageUrl?: string;
  supplier: string;
  supplierId: string;
  weight?: number;
  location?: string;
  lastUpdated: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  category: string;
  status: "active" | "inactive" | "on-hold";
  leadTimeDays: number;
  paymentTerms: string;
  rating: number;
  totalOrders: number;
  totalSpend: number;
  onTimeDelivery: number;
  fillRate: number;
  accountNumber: string;
  notes: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  type: "commercial" | "residential" | "industrial";
  status: "active" | "inactive";
  contractStart?: string;
  contractEnd?: string;
  serviceLevel: "standard" | "premium" | "enterprise";
  totalJobs: number;
  totalRevenue: number;
  balance: number;
  notes: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  status:
    | "draft"
    | "submitted"
    | "confirmed"
    | "partial"
    | "received"
    | "cancelled";
  orderDate: string;
  expectedDate: string;
  receivedDate?: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  items: POItem[];
  notes: string;
  createdBy: string;
  approvedBy?: string;
}

export interface POItem {
  partId: string;
  partName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  total: number;
  receivedQty: number;
}

export interface WorkOrder {
  id: string;
  woNumber: string;
  customerId: string;
  customerName: string;
  technicianId: string;
  technicianName: string;
  status: "open" | "in-progress" | "on-hold" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  type: "maintenance" | "repair" | "installation" | "inspection" | "emergency";
  title: string;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  laborHours: number;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  parts: WOPart[];
  notes: string;
  createdAt: string;
}

export interface WOPart {
  partId: string;
  partName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface Transaction {
  id: string;
  type: "receive" | "issue" | "transfer" | "return" | "adjustment" | "count";
  partId: string;
  partName: string;
  sku: string;
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  reference?: string;
  workOrderId?: string;
  purchaseOrderId?: string;
  notes: string;
  performedBy: string;
  timestamp: string;
  unitCost: number;
  totalValue: number;
}

export interface InventoryLocation {
  id: string;
  name: string;
  type: "warehouse" | "truck" | "job-site" | "supplier";
  address?: string;
  zone?: string;
  manager?: string;
  phone?: string;
  totalItems: number;
  totalValue: number;
  status: "active" | "inactive";
  notes: string;
}

export interface AlertRule {
  id: string;
  partId: string;
  partName: string;
  sku: string;
  currentStock: number;
  minStock: number;
  reorderPoint: number;
  severity: "critical" | "warning" | "info";
  status: "active" | "acknowledged" | "resolved";
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  location: string;
}

export interface Equipment {
  id: string;
  serialNumber: string;
  model: string;
  manufacturer: string;
  type:
    | "ahu"
    | "chiller"
    | "boiler"
    | "cooling-tower"
    | "pump"
    | "vav"
    | "exhaust-fan";
  customerId: string;
  customerName: string;
  location: string;
  installDate: string;
  warrantyExpiry: string;
  lastServiceDate: string;
  nextServiceDate: string;
  status: "active" | "maintenance" | "inactive" | "decommissioned";
  notes: string;
  serviceHistory: ServiceRecord[];
}

export interface ServiceRecord {
  id: string;
  date: string;
  type: string;
  technicianName: string;
  description: string;
  partsUsed: string[];
  cost: number;
  nextServiceDue: string;
}

export interface ServiceKit {
  id: string;
  kitNumber: string;
  name: string;
  description: string;
  category: string;
  equipmentType: string;
  status: "active" | "inactive";
  unitCost: number;
  components: KitComponent[];
  usageCount: number;
  lastUsed?: string;
  notes: string;
}

export interface KitComponent {
  partId: string;
  partName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  notes: string;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  certifications: string[];
  status: "active" | "inactive" | "on-leave";
  truckId?: string;
  hireDate: string;
  completedJobs: number;
  rating: number;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "technician" | "warehouse" | "viewer";
  status: "active" | "inactive" | "pending";
  lastLogin?: string;
  createdAt: string;
  permissions: string[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  description: string;
  timestamp: string;
  ip?: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

export const MOCK_PARTS: Part[] = [
  {
    id: "p001",
    sku: "BLT-A24",
    name: "V-Belt A24",
    category: "Belts",
    description: '1/2" x 26" V-belt for AHU units',
    unitCost: 8.5,
    unitPrice: 18.0,
    uom: "EA",
    minStock: 10,
    maxStock: 50,
    reorderPoint: 15,
    reorderQty: 25,
    totalStock: 8,
    status: "active",
    barcode: "0001234560001",
    supplier: "Grainger Industrial",
    supplierId: "s001",
    weight: 0.3,
    lastUpdated: "2026-06-01",
  },
  {
    id: "p002",
    sku: "BLT-B36",
    name: "V-Belt B36",
    category: "Belts",
    description: '21/32" x 39" V-belt for rooftop units',
    unitCost: 11.25,
    unitPrice: 24.0,
    uom: "EA",
    minStock: 8,
    maxStock: 40,
    reorderPoint: 12,
    reorderQty: 20,
    totalStock: 22,
    status: "active",
    barcode: "0001234560002",
    supplier: "Grainger Industrial",
    supplierId: "s001",
    weight: 0.5,
    lastUpdated: "2026-06-01",
  },
  {
    id: "p003",
    sku: "FLT-20x20x2",
    name: "Air Filter 20x20x2",
    category: "Filters",
    description: "MERV-8 pleated air filter",
    unitCost: 6.75,
    unitPrice: 14.0,
    uom: "EA",
    minStock: 20,
    maxStock: 100,
    reorderPoint: 30,
    reorderQty: 50,
    totalStock: 15,
    status: "active",
    barcode: "0001234560003",
    supplier: "AAF Flanders",
    supplierId: "s002",
    weight: 0.8,
    lastUpdated: "2026-06-02",
  },
  {
    id: "p004",
    sku: "FLT-16x25x2",
    name: "Air Filter 16x25x2",
    category: "Filters",
    description: "MERV-11 high-efficiency pleated filter",
    unitCost: 9.2,
    unitPrice: 19.5,
    uom: "EA",
    minStock: 15,
    maxStock: 80,
    reorderPoint: 25,
    reorderQty: 40,
    totalStock: 42,
    status: "active",
    barcode: "0001234560004",
    supplier: "AAF Flanders",
    supplierId: "s002",
    lastUpdated: "2026-06-02",
  },
  {
    id: "p005",
    sku: "CAP-45MFD",
    name: "Run Capacitor 45MFD",
    category: "Electrical",
    description: "370V run capacitor for condenser fan motors",
    unitCost: 12.4,
    unitPrice: 32.0,
    uom: "EA",
    minStock: 5,
    maxStock: 30,
    reorderPoint: 8,
    reorderQty: 15,
    totalStock: 4,
    status: "active",
    barcode: "0001234560005",
    supplier: "Johnstone Supply",
    supplierId: "s003",
    lastUpdated: "2026-06-03",
  },
  {
    id: "p006",
    sku: "CAP-35-5MFD",
    name: "Dual Run Capacitor 35/5MFD",
    category: "Electrical",
    description: "440V dual run capacitor",
    unitCost: 18.9,
    unitPrice: 45.0,
    uom: "EA",
    minStock: 5,
    maxStock: 25,
    reorderPoint: 8,
    reorderQty: 12,
    totalStock: 11,
    status: "active",
    barcode: "0001234560006",
    supplier: "Johnstone Supply",
    supplierId: "s003",
    lastUpdated: "2026-06-03",
  },
  {
    id: "p007",
    sku: "MTR-1HP-230",
    name: "Condenser Fan Motor 1HP",
    category: "Motors",
    description: "1HP 230V single-phase condenser fan motor",
    unitCost: 145.0,
    unitPrice: 320.0,
    uom: "EA",
    minStock: 2,
    maxStock: 10,
    reorderPoint: 3,
    reorderQty: 5,
    totalStock: 3,
    status: "active",
    barcode: "0001234560007",
    supplier: "WW Grainger",
    supplierId: "s001",
    lastUpdated: "2026-06-04",
  },
  {
    id: "p008",
    sku: "REF-410A-25LB",
    name: "R-410A Refrigerant 25lb",
    category: "Refrigerants",
    description: "25lb cylinder R-410A refrigerant",
    unitCost: 85.0,
    unitPrice: 180.0,
    uom: "CYL",
    minStock: 3,
    maxStock: 15,
    reorderPoint: 5,
    reorderQty: 6,
    totalStock: 7,
    status: "active",
    barcode: "0001234560008",
    supplier: "Refrigerants Plus",
    supplierId: "s004",
    weight: 32,
    lastUpdated: "2026-06-01",
  },
  {
    id: "p009",
    sku: "CTR-24VAC",
    name: "Contactor 24VAC Coil",
    category: "Electrical",
    description: "2-pole contactor 30A 24VAC coil",
    unitCost: 22.5,
    unitPrice: 55.0,
    uom: "EA",
    minStock: 5,
    maxStock: 25,
    reorderPoint: 8,
    reorderQty: 10,
    totalStock: 6,
    status: "active",
    barcode: "0001234560009",
    supplier: "Johnstone Supply",
    supplierId: "s003",
    lastUpdated: "2026-06-05",
  },
  {
    id: "p010",
    sku: "THR-STAT-PRG",
    name: "Programmable Thermostat",
    category: "Controls",
    description: "7-day programmable thermostat, 2H/2C",
    unitCost: 48.0,
    unitPrice: 115.0,
    uom: "EA",
    minStock: 3,
    maxStock: 20,
    reorderPoint: 5,
    reorderQty: 8,
    totalStock: 9,
    status: "active",
    barcode: "0001234560010",
    supplier: "Honeywell",
    supplierId: "s005",
    lastUpdated: "2026-06-05",
  },
  {
    id: "p011",
    sku: "BRNG-608ZZ",
    name: "Ball Bearing 608ZZ",
    category: "Bearings",
    description: "8x22x7mm double-shielded ball bearing",
    unitCost: 4.25,
    unitPrice: 12.0,
    uom: "EA",
    minStock: 10,
    maxStock: 60,
    reorderPoint: 20,
    reorderQty: 30,
    totalStock: 45,
    status: "active",
    barcode: "0001234560011",
    supplier: "Grainger Industrial",
    supplierId: "s001",
    lastUpdated: "2026-06-06",
  },
  {
    id: "p012",
    sku: "COIL-CLN-1GL",
    name: "Coil Cleaner 1 Gallon",
    category: "Chemicals",
    description: "Alkaline coil cleaner concentrate",
    unitCost: 18.0,
    unitPrice: 42.0,
    uom: "GAL",
    minStock: 6,
    maxStock: 30,
    reorderPoint: 10,
    reorderQty: 12,
    totalStock: 2,
    status: "active",
    barcode: "0001234560012",
    supplier: "Nu-Calgon",
    supplierId: "s006",
    weight: 9,
    lastUpdated: "2026-06-07",
  },
];

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: "s001",
    name: "Grainger Industrial",
    contactName: "Mike Thompson",
    email: "mthompson@grainger.com",
    phone: "(800) 472-4643",
    address: "100 Grainger Pkwy",
    city: "Lake Forest",
    state: "IL",
    zip: "60045",
    category: "General Industrial",
    status: "active",
    leadTimeDays: 2,
    paymentTerms: "Net 30",
    rating: 4.8,
    totalOrders: 156,
    totalSpend: 48250,
    onTimeDelivery: 97,
    fillRate: 99,
    accountNumber: "GR-10042",
    notes: "Preferred supplier for belts, bearings, and motors.",
    createdAt: "2023-01-15",
  },
  {
    id: "s002",
    name: "AAF Flanders",
    contactName: "Sarah Chen",
    email: "s.chen@aafflanders.com",
    phone: "(800) 223-2535",
    address: "6035 Parkland Blvd",
    city: "Louisville",
    state: "KY",
    zip: "40213",
    category: "Air Filtration",
    status: "active",
    leadTimeDays: 3,
    paymentTerms: "Net 30",
    rating: 4.6,
    totalOrders: 89,
    totalSpend: 22150,
    onTimeDelivery: 94,
    fillRate: 98,
    accountNumber: "AAF-7821",
    notes: "Primary filter supplier. Volume discounts available.",
    createdAt: "2023-03-01",
  },
  {
    id: "s003",
    name: "Johnstone Supply",
    contactName: "Carlos Rivera",
    email: "c.rivera@johnstonesupply.com",
    phone: "(800) 456-7890",
    address: "4000 N River Rd",
    city: "Schiller Park",
    state: "IL",
    zip: "60176",
    category: "HVAC Parts",
    status: "active",
    leadTimeDays: 1,
    paymentTerms: "Net 15",
    rating: 4.9,
    totalOrders: 203,
    totalSpend: 67400,
    onTimeDelivery: 98,
    fillRate: 97,
    accountNumber: "JS-445523",
    notes: "Same-day pickup available at local branch.",
    createdAt: "2022-08-10",
  },
  {
    id: "s004",
    name: "Refrigerants Plus",
    contactName: "David Park",
    email: "d.park@refplus.com",
    phone: "(877) 734-2687",
    address: "215 Industrial Dr",
    city: "Addison",
    state: "IL",
    zip: "60101",
    category: "Refrigerants",
    status: "active",
    leadTimeDays: 2,
    paymentTerms: "Net 30",
    rating: 4.4,
    totalOrders: 45,
    totalSpend: 31200,
    onTimeDelivery: 91,
    fillRate: 95,
    accountNumber: "RP-9921",
    notes: "EPA-certified refrigerant recovery required.",
    createdAt: "2023-05-20",
  },
  {
    id: "s005",
    name: "Honeywell Building Tech",
    contactName: "Lisa Nguyen",
    email: "l.nguyen@honeywell.com",
    phone: "(800) 328-5111",
    address: "9680 Old Bailes Rd",
    city: "Fort Mill",
    state: "SC",
    zip: "29707",
    category: "Controls & Thermostats",
    status: "active",
    leadTimeDays: 5,
    paymentTerms: "Net 45",
    rating: 4.7,
    totalOrders: 31,
    totalSpend: 15800,
    onTimeDelivery: 89,
    fillRate: 96,
    accountNumber: "HW-BLDG-4412",
    notes: "Direct factory account. Technical support available.",
    createdAt: "2023-02-14",
  },
  {
    id: "s006",
    name: "Nu-Calgon",
    contactName: "Brian Walsh",
    email: "b.walsh@nucalgon.com",
    phone: "(800) 554-5499",
    address: "2008 Altom Ct",
    city: "St. Louis",
    state: "MO",
    zip: "63146",
    category: "Chemicals & Cleaners",
    status: "active",
    leadTimeDays: 4,
    paymentTerms: "Net 30",
    rating: 4.3,
    totalOrders: 28,
    totalSpend: 8640,
    onTimeDelivery: 88,
    fillRate: 94,
    accountNumber: "NC-5530",
    notes: "Seasonal volume increases. Monitor stock levels.",
    createdAt: "2023-07-01",
  },
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "c001",
    name: "Metro Office Plaza",
    contactName: "Jennifer Adams",
    email: "j.adams@metroplaza.com",
    phone: "(312) 555-0101",
    address: "200 N Michigan Ave",
    city: "Chicago",
    state: "IL",
    zip: "60601",
    type: "commercial",
    status: "active",
    contractStart: "2024-01-01",
    contractEnd: "2026-12-31",
    serviceLevel: "enterprise",
    totalJobs: 48,
    totalRevenue: 128400,
    balance: 0,
    notes: "Annual PM contract. 4 RTUs, 12 AHUs.",
    createdAt: "2024-01-01",
  },
  {
    id: "c002",
    name: "Riverside Medical Center",
    contactName: "Dr. Robert Kim",
    email: "r.kim@riversidemedical.org",
    phone: "(312) 555-0202",
    address: "450 E 31st St",
    city: "Chicago",
    state: "IL",
    zip: "60616",
    type: "commercial",
    status: "active",
    contractStart: "2023-06-01",
    contractEnd: "2026-05-31",
    serviceLevel: "enterprise",
    totalJobs: 96,
    totalRevenue: 284100,
    balance: 12500,
    notes: "Critical facility. 24/7 support required. HEPA filtration systems.",
    createdAt: "2023-06-01",
  },
  {
    id: "c003",
    name: "Lakeside Industrial Park",
    contactName: "Tom Garcia",
    email: "t.garcia@lakeside-ind.com",
    phone: "(847) 555-0303",
    address: "1200 Industrial Blvd",
    city: "Waukegan",
    state: "IL",
    zip: "60085",
    type: "industrial",
    status: "active",
    contractStart: "2024-03-01",
    contractEnd: "2025-02-28",
    serviceLevel: "premium",
    totalJobs: 22,
    totalRevenue: 58600,
    balance: 4800,
    notes: "Cooling tower maintenance included. Quarterly services.",
    createdAt: "2024-03-01",
  },
  {
    id: "c004",
    name: "Greenwood Apartments",
    contactName: "Maria Sanchez",
    email: "m.sanchez@greenwood-apts.com",
    phone: "(773) 555-0404",
    address: "8800 S Stony Island Ave",
    city: "Chicago",
    state: "IL",
    zip: "60617",
    type: "residential",
    status: "active",
    serviceLevel: "standard",
    totalJobs: 34,
    totalRevenue: 28900,
    balance: 650,
    notes: "240 units. Package units on each floor. Monthly filter service.",
    createdAt: "2023-09-15",
  },
  {
    id: "c005",
    name: "North Shore University",
    contactName: "Prof. Alan Wright",
    email: "a.wright@northshoreuniv.edu",
    phone: "(847) 555-0505",
    address: "2100 Campus Dr",
    city: "Evanston",
    state: "IL",
    zip: "60208",
    type: "commercial",
    status: "active",
    contractStart: "2024-08-01",
    contractEnd: "2027-07-31",
    serviceLevel: "enterprise",
    totalJobs: 18,
    totalRevenue: 76200,
    balance: 0,
    notes: "Lab-grade air quality required. Fume hood systems included.",
    createdAt: "2024-08-01",
  },
];

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "po001",
    poNumber: "PO-2026-0089",
    supplierId: "s001",
    supplierName: "Grainger Industrial",
    status: "received",
    orderDate: "2026-05-20",
    expectedDate: "2026-05-22",
    receivedDate: "2026-05-22",
    subtotal: 842.5,
    tax: 89.32,
    shipping: 0,
    total: 931.82,
    items: [
      {
        partId: "p001",
        partName: "V-Belt A24",
        sku: "BLT-A24",
        quantity: 25,
        unitCost: 8.5,
        total: 212.5,
        receivedQty: 25,
      },
      {
        partId: "p002",
        partName: "V-Belt B36",
        sku: "BLT-B36",
        quantity: 20,
        unitCost: 11.25,
        total: 225.0,
        receivedQty: 20,
      },
    ],
    notes: "Rush order for summer maintenance season",
    createdBy: "Mike Johnson",
    approvedBy: "Sarah Williams",
  },
  {
    id: "po002",
    poNumber: "PO-2026-0090",
    supplierId: "s002",
    supplierName: "AAF Flanders",
    status: "confirmed",
    orderDate: "2026-06-01",
    expectedDate: "2026-06-05",
    subtotal: 1150.0,
    tax: 121.9,
    shipping: 45.0,
    total: 1316.9,
    items: [
      {
        partId: "p003",
        partName: "Air Filter 20x20x2",
        sku: "FLT-20x20x2",
        quantity: 50,
        unitCost: 6.75,
        total: 337.5,
        receivedQty: 0,
      },
      {
        partId: "p004",
        partName: "Air Filter 16x25x2",
        sku: "FLT-16x25x2",
        quantity: 40,
        unitCost: 9.2,
        total: 368.0,
        receivedQty: 0,
      },
    ],
    notes: "Quarterly filter replenishment",
    createdBy: "Sarah Williams",
    approvedBy: "Mike Johnson",
  },
  {
    id: "po003",
    poNumber: "PO-2026-0091",
    supplierId: "s003",
    supplierName: "Johnstone Supply",
    status: "submitted",
    orderDate: "2026-06-07",
    expectedDate: "2026-06-09",
    subtotal: 647.0,
    tax: 68.58,
    shipping: 0,
    total: 715.58,
    items: [
      {
        partId: "p005",
        partName: "Run Capacitor 45MFD",
        sku: "CAP-45MFD",
        quantity: 15,
        unitCost: 12.4,
        total: 186.0,
        receivedQty: 0,
      },
      {
        partId: "p009",
        partName: "Contactor 24VAC",
        sku: "CTR-24VAC",
        quantity: 10,
        unitCost: 22.5,
        total: 225.0,
        receivedQty: 0,
      },
    ],
    notes: "Reorder from low-stock alert",
    createdBy: "Mike Johnson",
  },
  {
    id: "po004",
    poNumber: "PO-2026-0088",
    supplierId: "s004",
    supplierName: "Refrigerants Plus",
    status: "partial",
    orderDate: "2026-05-15",
    expectedDate: "2026-05-18",
    receivedDate: "2026-05-19",
    subtotal: 510.0,
    tax: 54.06,
    shipping: 25.0,
    total: 589.06,
    items: [
      {
        partId: "p008",
        partName: "R-410A 25lb",
        sku: "REF-410A-25LB",
        quantity: 6,
        unitCost: 85.0,
        total: 510.0,
        receivedQty: 4,
      },
    ],
    notes: "Emergency restock — 2 cylinders backordered",
    createdBy: "Tom Davis",
  },
];

export const MOCK_WORK_ORDERS: WorkOrder[] = [
  {
    id: "wo001",
    woNumber: "WO-2026-0342",
    customerId: "c001",
    customerName: "Metro Office Plaza",
    technicianId: "t001",
    technicianName: "James Rodriguez",
    status: "in-progress",
    priority: "high",
    type: "maintenance",
    title: "Quarterly PM - RTU-01 & RTU-02",
    description:
      "Quarterly preventive maintenance on two rooftop units. Replace filters, check belts, inspect coils.",
    scheduledDate: "2026-06-09",
    laborHours: 4,
    laborCost: 320,
    partsCost: 85.5,
    totalCost: 405.5,
    parts: [
      {
        partId: "p003",
        partName: "Air Filter 20x20x2",
        sku: "FLT-20x20x2",
        quantity: 8,
        unitCost: 6.75,
        total: 54.0,
      },
      {
        partId: "p001",
        partName: "V-Belt A24",
        sku: "BLT-A24",
        quantity: 4,
        unitCost: 8.5,
        total: 34.0,
      },
    ],
    notes: "Customer requests completion before 3pm.",
    createdAt: "2026-06-05",
  },
  {
    id: "wo002",
    woNumber: "WO-2026-0341",
    customerId: "c002",
    customerName: "Riverside Medical Center",
    technicianId: "t002",
    technicianName: "Amanda Foster",
    status: "open",
    priority: "urgent",
    type: "repair",
    title: "AHU-7 Compressor Contactor Failure",
    description:
      "Compressor contactor failed causing unit shutdown. Critical repair needed.",
    scheduledDate: "2026-06-09",
    laborHours: 2,
    laborCost: 190,
    partsCost: 45.0,
    totalCost: 235.0,
    parts: [
      {
        partId: "p009",
        partName: "Contactor 24VAC",
        sku: "CTR-24VAC",
        quantity: 2,
        unitCost: 22.5,
        total: 45.0,
      },
    ],
    notes: "ICU wing critical. Escalate if any delays.",
    createdAt: "2026-06-08",
  },
  {
    id: "wo003",
    woNumber: "WO-2026-0340",
    customerId: "c004",
    customerName: "Greenwood Apartments",
    technicianId: "t003",
    technicianName: "Kevin Park",
    status: "completed",
    priority: "medium",
    type: "maintenance",
    title: "Monthly Filter Service - Floors 1-5",
    description: "Replace all filters floors 1-5, 48 units total.",
    scheduledDate: "2026-06-03",
    completedDate: "2026-06-03",
    laborHours: 6,
    laborCost: 450,
    partsCost: 324.0,
    totalCost: 774.0,
    parts: [
      {
        partId: "p003",
        partName: "Air Filter 20x20x2",
        sku: "FLT-20x20x2",
        quantity: 48,
        unitCost: 6.75,
        total: 324.0,
      },
    ],
    notes: "All filters replaced. One unit needs belt inspection next visit.",
    createdAt: "2026-05-28",
  },
  {
    id: "wo004",
    woNumber: "WO-2026-0339",
    customerId: "c003",
    customerName: "Lakeside Industrial Park",
    technicianId: "t001",
    technicianName: "James Rodriguez",
    status: "on-hold",
    priority: "low",
    type: "inspection",
    title: "Cooling Tower Annual Inspection",
    description: "Annual cooling tower inspection and water treatment check.",
    scheduledDate: "2026-06-15",
    laborHours: 8,
    laborCost: 640,
    partsCost: 0,
    totalCost: 640,
    parts: [],
    notes: "On hold pending customer access approval.",
    createdAt: "2026-06-01",
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "tr001",
    type: "receive",
    partId: "p001",
    partName: "V-Belt A24",
    sku: "BLT-A24",
    quantity: 25,
    toLocation: "Main Warehouse",
    reference: "PO-2026-0089",
    notes: "PO receipt",
    performedBy: "Mike Johnson",
    timestamp: "2026-05-22T09:15:00Z",
    unitCost: 8.5,
    totalValue: 212.5,
  },
  {
    id: "tr002",
    type: "issue",
    partId: "p003",
    partName: "Air Filter 20x20x2",
    sku: "FLT-20x20x2",
    quantity: 8,
    fromLocation: "Main Warehouse",
    toLocation: "Truck T-01",
    reference: "WO-2026-0342",
    workOrderId: "wo001",
    notes: "Issued for Metro Office Plaza PM",
    performedBy: "James Rodriguez",
    timestamp: "2026-06-09T07:30:00Z",
    unitCost: 6.75,
    totalValue: 54.0,
  },
  {
    id: "tr003",
    type: "transfer",
    partId: "p004",
    partName: "Air Filter 16x25x2",
    sku: "FLT-16x25x2",
    quantity: 10,
    fromLocation: "Main Warehouse",
    toLocation: "Truck T-02",
    notes: "Restock truck for weekly route",
    performedBy: "Sarah Williams",
    timestamp: "2026-06-08T16:00:00Z",
    unitCost: 9.2,
    totalValue: 92.0,
  },
  {
    id: "tr004",
    type: "adjustment",
    partId: "p012",
    partName: "Coil Cleaner 1 Gallon",
    sku: "COIL-CLN-1GL",
    quantity: -1,
    fromLocation: "Main Warehouse",
    notes: "Cycle count discrepancy correction",
    performedBy: "Tom Davis",
    timestamp: "2026-06-07T14:00:00Z",
    unitCost: 18.0,
    totalValue: -18.0,
  },
  {
    id: "tr005",
    type: "return",
    partId: "p009",
    partName: "Contactor 24VAC",
    sku: "CTR-24VAC",
    quantity: 1,
    toLocation: "Main Warehouse",
    fromLocation: "Truck T-01",
    reference: "WO-2026-0340",
    notes: "Unused part returned from job",
    performedBy: "James Rodriguez",
    timestamp: "2026-06-06T17:30:00Z",
    unitCost: 22.5,
    totalValue: 22.5,
  },
  {
    id: "tr006",
    type: "count",
    partId: "p008",
    partName: "R-410A 25lb",
    sku: "REF-410A-25LB",
    quantity: 7,
    fromLocation: "Main Warehouse",
    notes: "Quarterly cycle count — matches records",
    performedBy: "Sarah Williams",
    timestamp: "2026-06-05T10:00:00Z",
    unitCost: 85.0,
    totalValue: 595.0,
  },
];

export const MOCK_LOCATIONS: InventoryLocation[] = [
  {
    id: "loc001",
    name: "Main Warehouse",
    type: "warehouse",
    address: "4200 W 47th St, Chicago, IL 60632",
    zone: "Zone A-D",
    manager: "Sarah Williams",
    phone: "(773) 555-1001",
    totalItems: 312,
    totalValue: 48650,
    status: "active",
    notes: "Primary stocking location. Climate-controlled.",
  },
  {
    id: "loc002",
    name: "Service Truck T-01",
    type: "truck",
    manager: "James Rodriguez",
    phone: "(773) 555-1002",
    totalItems: 48,
    totalValue: 3220,
    status: "active",
    notes: "Assigned to North Side route",
  },
  {
    id: "loc003",
    name: "Service Truck T-02",
    type: "truck",
    manager: "Amanda Foster",
    phone: "(773) 555-1003",
    totalItems: 52,
    totalValue: 3890,
    status: "active",
    notes: "Assigned to South Side route",
  },
  {
    id: "loc004",
    name: "Service Truck T-03",
    type: "truck",
    manager: "Kevin Park",
    phone: "(773) 555-1004",
    totalItems: 40,
    totalValue: 2640,
    status: "active",
    notes: "Residential route",
  },
  {
    id: "loc005",
    name: "Riverside Medical Cage",
    type: "job-site",
    address: "450 E 31st St, Chicago, IL 60616",
    manager: "Amanda Foster",
    totalItems: 24,
    totalValue: 1840,
    status: "active",
    notes: "On-site stocking at medical center. Critical facility.",
  },
];

export const MOCK_ALERTS: AlertRule[] = [
  {
    id: "al001",
    partId: "p001",
    partName: "V-Belt A24",
    sku: "BLT-A24",
    currentStock: 8,
    minStock: 10,
    reorderPoint: 15,
    severity: "critical",
    status: "active",
    createdAt: "2026-06-08T06:00:00Z",
    location: "Main Warehouse",
  },
  {
    id: "al002",
    partId: "p003",
    partName: "Air Filter 20x20x2",
    sku: "FLT-20x20x2",
    currentStock: 15,
    minStock: 20,
    reorderPoint: 30,
    severity: "warning",
    status: "active",
    createdAt: "2026-06-07T06:00:00Z",
    location: "Main Warehouse",
  },
  {
    id: "al003",
    partId: "p005",
    partName: "Run Capacitor 45MFD",
    sku: "CAP-45MFD",
    currentStock: 4,
    minStock: 5,
    reorderPoint: 8,
    severity: "critical",
    status: "active",
    createdAt: "2026-06-08T06:00:00Z",
    location: "Main Warehouse",
  },
  {
    id: "al004",
    partId: "p012",
    partName: "Coil Cleaner 1 Gallon",
    sku: "COIL-CLN-1GL",
    currentStock: 2,
    minStock: 6,
    reorderPoint: 10,
    severity: "critical",
    status: "active",
    createdAt: "2026-06-07T06:00:00Z",
    location: "Main Warehouse",
  },
  {
    id: "al005",
    partId: "p007",
    partName: "Condenser Fan Motor 1HP",
    sku: "MTR-1HP-230",
    currentStock: 3,
    minStock: 2,
    reorderPoint: 3,
    severity: "warning",
    status: "acknowledged",
    createdAt: "2026-06-06T06:00:00Z",
    acknowledgedAt: "2026-06-06T08:30:00Z",
    location: "Main Warehouse",
  },
];

export const MOCK_EQUIPMENT: Equipment[] = [
  {
    id: "eq001",
    serialNumber: "CAR-52XH-00812",
    model: "50XC060300",
    manufacturer: "Carrier",
    type: "ahu",
    customerId: "c001",
    customerName: "Metro Office Plaza",
    location: "Roof - Zone A",
    installDate: "2020-04-15",
    warrantyExpiry: "2025-04-15",
    lastServiceDate: "2026-03-15",
    nextServiceDate: "2026-06-15",
    status: "active",
    notes: "5-ton rooftop unit. East wing primary.",
    serviceHistory: [
      {
        id: "sr001",
        date: "2026-03-15",
        type: "Quarterly PM",
        technicianName: "James Rodriguez",
        description: "Replaced belts A24, cleaned coils, changed filters",
        partsUsed: ["BLT-A24", "FLT-20x20x2"],
        cost: 285,
        nextServiceDue: "2026-06-15",
      },
    ],
  },
  {
    id: "eq002",
    serialNumber: "TRN-CVHE-44912",
    model: "CVHE300",
    manufacturer: "Trane",
    type: "chiller",
    customerId: "c002",
    customerName: "Riverside Medical Center",
    location: "Mechanical Room B1",
    installDate: "2018-08-20",
    warrantyExpiry: "2023-08-20",
    lastServiceDate: "2026-05-01",
    nextServiceDate: "2026-08-01",
    status: "active",
    notes: "300-ton centrifugal chiller. Critical system.",
    serviceHistory: [
      {
        id: "sr002",
        date: "2026-05-01",
        type: "Semi-annual Service",
        technicianName: "Amanda Foster",
        description: "Oil analysis, vibration analysis, leak check",
        partsUsed: [],
        cost: 1200,
        nextServiceDue: "2026-08-01",
      },
    ],
  },
  {
    id: "eq003",
    serialNumber: "YRK-YCAZ-22134",
    model: "YCAZ0170",
    manufacturer: "York",
    type: "cooling-tower",
    customerId: "c003",
    customerName: "Lakeside Industrial Park",
    location: "Cooling Tower Pad",
    installDate: "2019-06-01",
    warrantyExpiry: "2024-06-01",
    lastServiceDate: "2026-01-10",
    nextServiceDate: "2026-07-10",
    status: "maintenance",
    notes: "Annual inspection pending. Water treatment contract.",
    serviceHistory: [],
  },
];

export const MOCK_SERVICE_KITS: ServiceKit[] = [
  {
    id: "sk001",
    kitNumber: "KIT-RTU-PM-Q",
    name: "RTU Quarterly PM Kit",
    description:
      "Complete quarterly PM kit for standard rooftop units up to 5 tons",
    category: "Preventive Maintenance",
    equipmentType: "RTU",
    status: "active",
    unitCost: 68.5,
    usageCount: 24,
    lastUsed: "2026-06-09",
    components: [
      {
        partId: "p001",
        partName: "V-Belt A24",
        sku: "BLT-A24",
        quantity: 2,
        unitCost: 8.5,
        notes: "",
      },
      {
        partId: "p003",
        partName: "Air Filter 20x20x2",
        sku: "FLT-20x20x2",
        quantity: 4,
        unitCost: 6.75,
        notes: "Replace all return air filters",
      },
      {
        partId: "p012",
        partName: "Coil Cleaner 1 Gallon",
        sku: "COIL-CLN-1GL",
        quantity: 0.5,
        unitCost: 18.0,
        notes: "Evaporator coil cleaning",
      },
    ],
    notes: "Standard kit for CAR and TRN rooftop units.",
  },
  {
    id: "sk002",
    kitNumber: "KIT-CAP-REPLACE",
    name: "Capacitor Replacement Kit",
    description:
      "Dual and single run capacitor replacement kit for condensing units",
    category: "Repair",
    equipmentType: "Condenser",
    status: "active",
    unitCost: 49.8,
    usageCount: 18,
    lastUsed: "2026-05-28",
    components: [
      {
        partId: "p005",
        partName: "Run Capacitor 45MFD",
        sku: "CAP-45MFD",
        quantity: 1,
        unitCost: 12.4,
        notes: "",
      },
      {
        partId: "p006",
        partName: "Dual Run Capacitor 35/5MFD",
        sku: "CAP-35-5MFD",
        quantity: 1,
        unitCost: 18.9,
        notes: "Replace both during service call",
      },
    ],
    notes: "Include both types — confirm part on-site before installation.",
  },
  {
    id: "sk003",
    kitNumber: "KIT-CHILLER-SA",
    name: "Chiller Semi-Annual Kit",
    description: "Semi-annual service kit for centrifugal and scroll chillers",
    category: "Preventive Maintenance",
    equipmentType: "Chiller",
    status: "active",
    unitCost: 0,
    usageCount: 6,
    lastUsed: "2026-05-01",
    components: [],
    notes: "Parts selected per chiller model. Consult tech manual.",
  },
];

export const MOCK_TECHNICIANS: Technician[] = [
  {
    id: "t001",
    name: "James Rodriguez",
    email: "j.rodriguez@hvacpro.com",
    phone: "(773) 555-2001",
    certifications: ["EPA 608 Universal", "NATE Certified", "R-410A"],
    status: "active",
    truckId: "loc002",
    hireDate: "2019-03-15",
    completedJobs: 342,
    rating: 4.9,
  },
  {
    id: "t002",
    name: "Amanda Foster",
    email: "a.foster@hvacpro.com",
    phone: "(773) 555-2002",
    certifications: [
      "EPA 608 Universal",
      "NATE Certified",
      "Building Automation",
    ],
    status: "active",
    truckId: "loc003",
    hireDate: "2020-08-01",
    completedJobs: 218,
    rating: 4.8,
  },
  {
    id: "t003",
    name: "Kevin Park",
    email: "k.park@hvacpro.com",
    phone: "(773) 555-2003",
    certifications: ["EPA 608 Type II", "NATE Residential"],
    status: "active",
    truckId: "loc004",
    hireDate: "2021-05-20",
    completedJobs: 156,
    rating: 4.7,
  },
  {
    id: "t004",
    name: "Priya Patel",
    email: "p.patel@hvacpro.com",
    phone: "(773) 555-2004",
    certifications: ["EPA 608 Universal", "NATE Certified", "LEED GA"],
    status: "on-leave",
    hireDate: "2022-01-10",
    completedJobs: 89,
    rating: 4.6,
  },
];

export const MOCK_USERS: AppUser[] = [
  {
    id: "u001",
    name: "Mike Johnson",
    email: "mike.j@hvacpro.com",
    role: "admin",
    status: "active",
    lastLogin: "2026-06-09T08:00:00Z",
    createdAt: "2022-01-01",
    permissions: ["all"],
  },
  {
    id: "u002",
    name: "Sarah Williams",
    email: "s.williams@hvacpro.com",
    role: "manager",
    status: "active",
    lastLogin: "2026-06-09T07:45:00Z",
    createdAt: "2022-03-15",
    permissions: ["inventory", "orders", "reports", "users-view"],
  },
  {
    id: "u003",
    name: "James Rodriguez",
    email: "j.rodriguez@hvacpro.com",
    role: "technician",
    status: "active",
    lastLogin: "2026-06-09T06:30:00Z",
    createdAt: "2022-06-01",
    permissions: ["work-orders", "inventory-view", "transactions"],
  },
  {
    id: "u004",
    name: "Tom Davis",
    email: "t.davis@hvacpro.com",
    role: "warehouse",
    status: "active",
    lastLogin: "2026-06-08T16:00:00Z",
    createdAt: "2023-02-10",
    permissions: ["inventory", "transactions", "orders-view"],
  },
  {
    id: "u005",
    name: "Linda Chen",
    email: "l.chen@hvacpro.com",
    role: "viewer",
    status: "active",
    lastLogin: "2026-06-07T10:00:00Z",
    createdAt: "2023-07-01",
    permissions: ["view-all"],
  },
];

export const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: "act001",
    userId: "u001",
    userName: "Mike Johnson",
    action: "CREATE",
    entity: "PurchaseOrder",
    entityId: "po003",
    description: "Created PO-2026-0091 for Johnstone Supply",
    timestamp: "2026-06-07T09:30:00Z",
    ip: "192.168.1.10",
  },
  {
    id: "act002",
    userId: "u002",
    userName: "Sarah Williams",
    action: "UPDATE",
    entity: "Inventory",
    entityId: "p008",
    description: "Adjusted R-410A stock after cycle count",
    timestamp: "2026-06-07T10:15:00Z",
    ip: "192.168.1.11",
  },
  {
    id: "act003",
    userId: "u003",
    userName: "James Rodriguez",
    action: "ISSUE",
    entity: "Transaction",
    entityId: "tr002",
    description: "Issued 8x FLT-20x20x2 to Truck T-01 for WO-2026-0342",
    timestamp: "2026-06-09T07:30:00Z",
    ip: "192.168.1.20",
  },
  {
    id: "act004",
    userId: "u004",
    userName: "Tom Davis",
    action: "RECEIVE",
    entity: "Transaction",
    entityId: "tr001",
    description: "Received 25x BLT-A24 from PO-2026-0089",
    timestamp: "2026-05-22T09:15:00Z",
    ip: "192.168.1.15",
  },
  {
    id: "act005",
    userId: "u002",
    userName: "Sarah Williams",
    action: "ACKNOWLEDGE",
    entity: "Alert",
    entityId: "al005",
    description: "Acknowledged low stock alert for MTR-1HP-230",
    timestamp: "2026-06-06T08:30:00Z",
    ip: "192.168.1.11",
  },
  {
    id: "act006",
    userId: "u001",
    userName: "Mike Johnson",
    action: "APPROVE",
    entity: "PurchaseOrder",
    entityId: "po002",
    description: "Approved PO-2026-0090 for AAF Flanders",
    timestamp: "2026-06-01T14:00:00Z",
    ip: "192.168.1.10",
  },
];

// ─── KPI Data ────────────────────────────────────────────────────────────────

export const MOCK_KPI = {
  totalParts: MOCK_PARTS.length,
  totalInventoryValue: MOCK_PARTS.reduce(
    (sum, p) => sum + p.unitCost * p.totalStock,
    0,
  ),
  lowStockItems: MOCK_ALERTS.filter((a) => a.status === "active").length,
  openWorkOrders: MOCK_WORK_ORDERS.filter(
    (wo) => wo.status === "open" || wo.status === "in-progress",
  ).length,
  pendingPOs: MOCK_PURCHASE_ORDERS.filter(
    (po) => po.status === "submitted" || po.status === "confirmed",
  ).length,
  totalSuppliers: MOCK_SUPPLIERS.filter((s) => s.status === "active").length,
  totalCustomers: MOCK_CUSTOMERS.filter((c) => c.status === "active").length,
  monthlyCost: 18450,
  monthlyRevenue: 52300,
  technicianUtilization: 87,
};

// ─── Context ─────────────────────────────────────────────────────────────────

interface MockDataContextValue {
  parts: Part[];
  suppliers: Supplier[];
  customers: Customer[];
  purchaseOrders: PurchaseOrder[];
  workOrders: WorkOrder[];
  transactions: Transaction[];
  locations: InventoryLocation[];
  alerts: AlertRule[];
  equipment: Equipment[];
  serviceKits: ServiceKit[];
  technicians: Technician[];
  users: AppUser[];
  activityLogs: ActivityLog[];
  kpi: typeof MOCK_KPI;
}

const MockDataContext = createContext<MockDataContextValue | null>(null);

export function MockDataProvider({ children }: { children: ReactNode }) {
  const value: MockDataContextValue = {
    parts: MOCK_PARTS,
    suppliers: MOCK_SUPPLIERS,
    customers: MOCK_CUSTOMERS,
    purchaseOrders: MOCK_PURCHASE_ORDERS,
    workOrders: MOCK_WORK_ORDERS,
    transactions: MOCK_TRANSACTIONS,
    locations: MOCK_LOCATIONS,
    alerts: MOCK_ALERTS,
    equipment: MOCK_EQUIPMENT,
    serviceKits: MOCK_SERVICE_KITS,
    technicians: MOCK_TECHNICIANS,
    users: MOCK_USERS,
    activityLogs: MOCK_ACTIVITY_LOGS,
    kpi: MOCK_KPI,
  };

  return (
    <MockDataContext.Provider value={value}>
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const ctx = useContext(MockDataContext);
  if (!ctx) throw new Error("useMockData must be used within MockDataProvider");
  return ctx;
}
