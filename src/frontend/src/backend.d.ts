import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Location {
    id: bigint;
    filterRequirements: Array<[string, bigint]>;
    active: boolean;
    name: string;
    completed: boolean;
    beltRequirements: Array<[string, bigint]>;
    isActive: boolean;
    zones: Array<string>;
    address?: string;
    managerId?: bigint;
    locationType: Variant_JobSite_SecondaryStorage_Warehouse_ServiceTruck;
}
export interface ServiceKitPart {
    quantity: bigint;
    partId: bigint;
}
export interface GasketInfo {
    glassFreezer: string;
    freezer: string;
    locationId: bigint;
    outsideDressTable: string;
    insideDress: string;
    cooler: string;
    fryFreezer: string;
    grillBox: string;
}
export interface OrderItem {
    itemId: bigint;
    name: string;
    quantity: bigint;
}
export interface WorkOrderPart {
    totalCost: number;
    quantity: bigint;
    partId: bigint;
    unitCost: number;
}
export interface WorkOrder {
    id: bigint;
    completedDate?: bigint;
    status: Variant_Invoiced_Scheduled_Cancelled_InProgress_Completed;
    title: string;
    scheduledDate: bigint;
    laborHours: number;
    totalCost: number;
    description: string;
    locationId: bigint;
    technicianId: bigint;
    notes?: string;
    customerId: bigint;
    priority: Variant_Low_High_Medium_Emergency;
    assignedParts: Array<WorkOrderPart>;
}
export interface StagingReport {
    locationId: bigint;
    items: Array<[string, bigint]>;
    locationName: string;
}
export interface PurchaseOrderItem {
    itemId: bigint;
    receivedQuantity: bigint;
    notes?: string;
    quantity: bigint;
    unitCost: number;
}
export interface MaintenanceRecord {
    id: bigint;
    completedDate?: bigint;
    status: Variant_Overdue_Scheduled_Cancelled_InProgress_Completed;
    scheduledDate: bigint;
    cost: number;
    partsUsed: Array<WorkOrderPart>;
    equipmentType: string;
    technicianId: bigint;
    notes?: string;
    workPerformed: string;
    equipmentId: bigint;
}
export interface ReorderAlert {
    id: bigint;
    status: Variant_Ordered_Acknowledged_Active_Resolved;
    itemId: bigint;
    reorderPoint: bigint;
    createdDate: bigint;
    suggestedQuantity: bigint;
    locationId: bigint;
    currentStock: bigint;
}
export interface Technician {
    id: bigint;
    assignedTruckId?: bigint;
    name: string;
    role: string;
    isActive: boolean;
    email: string;
    phone: string;
    skills: Array<string>;
}
export interface Transaction {
    id: bigint;
    itemId: bigint;
    transactionType: Variant_Loss_Issued_Transfer_Returned_Damaged_Adjustment_Receipt;
    toLocationId?: bigint;
    userId: Principal;
    fromLocationId?: bigint;
    notes?: string;
    timestamp: bigint;
    quantity: bigint;
    relatedOrderId?: bigint;
    reason: string;
}
export interface Customer {
    id: bigint;
    zip: string;
    city: string;
    name: string;
    equipmentList: Array<bigint>;
    email: string;
    state: string;
    address: string;
    notes?: string;
    phone: string;
    serviceHistory: Array<bigint>;
}
export interface CustomReport {
    selectedLocations: Array<Location>;
    combinedTotals: Array<[string, bigint]>;
}
export interface ActivityLog {
    id: bigint;
    action: string;
    userId: Principal;
    entityId: bigint;
    timestamp: bigint;
    details?: string;
    entityType: string;
}
export interface StockLevel {
    bin?: string;
    itemId: bigint;
    beginningInventory?: bigint;
    zone?: string;
    lastUpdated: bigint;
    locationId: bigint;
    quantity: bigint;
    currentStock?: bigint;
    receive1?: bigint;
    receive2?: bigint;
    receive3?: bigint;
}
export interface Item {
    id: bigint;
    sku: string;
    unitOfMeasure: string;
    supplierIds: Array<bigint>;
    reorderPoint: bigint;
    maxStock: bigint;
    subcategory: string;
    cost: number;
    name: string;
    unit: string;
    description: string;
    sellPrice: number;
    isActive: boolean;
    customFields: Array<[string, string]>;
    variantOf?: bigint;
    barcode?: string;
    category: string;
    qrCode?: string;
}
export interface CustomerEquipment {
    id: bigint;
    model: string;
    purchaseDate?: bigint;
    equipmentType: string;
    installDate?: bigint;
    serialNumber: string;
    warrantyExpiry?: bigint;
    customerId: bigint;
    brand: string;
    location: string;
}
export interface ServiceKit {
    id: bigint;
    name: string;
    totalCost: number;
    description: string;
    estimatedLaborHours: number;
    category: string;
    parts: Array<ServiceKitPart>;
}
export interface PurchaseOrder {
    id: bigint;
    status: Variant_Sent_Closed_Acknowledged_PartiallyReceived_Draft_Received;
    createdDate: bigint;
    totalCost: number;
    receivedDate?: bigint;
    notes?: string;
    items: Array<PurchaseOrderItem>;
    expectedDate?: bigint;
    supplierId: bigint;
}
export interface Supplier {
    id: bigint;
    contactName: string;
    name: string;
    isActive: boolean;
    email: string;
    website?: string;
    leadTimeDays: bigint;
    address: string;
    rating: number;
    paymentTerms: string;
    phone: string;
}
export interface UserProfile {
    name: string;
}
export enum Variant_Invoiced_Scheduled_Cancelled_InProgress_Completed {
    Invoiced = "Invoiced",
    Scheduled = "Scheduled",
    Cancelled = "Cancelled",
    InProgress = "InProgress",
    Completed = "Completed"
}
export enum Variant_JobSite_SecondaryStorage_Warehouse_ServiceTruck {
    JobSite = "JobSite",
    SecondaryStorage = "SecondaryStorage",
    Warehouse = "Warehouse",
    ServiceTruck = "ServiceTruck"
}
export enum Variant_Loss_Issued_Transfer_Returned_Damaged_Adjustment_Receipt {
    Loss = "Loss",
    Issued = "Issued",
    Transfer = "Transfer",
    Returned = "Returned",
    Damaged = "Damaged",
    Adjustment = "Adjustment",
    Receipt = "Receipt"
}
export enum Variant_Low_High_Medium_Emergency {
    Low = "Low",
    High = "High",
    Medium = "Medium",
    Emergency = "Emergency"
}
export enum Variant_Ordered_Acknowledged_Active_Resolved {
    Ordered = "Ordered",
    Acknowledged = "Acknowledged",
    Active = "Active",
    Resolved = "Resolved"
}
export enum Variant_Overdue_Scheduled_Cancelled_InProgress_Completed {
    Overdue = "Overdue",
    Scheduled = "Scheduled",
    Cancelled = "Cancelled",
    InProgress = "InProgress",
    Completed = "Completed"
}
export enum Variant_Sent_Closed_Acknowledged_PartiallyReceived_Draft_Received {
    Sent = "Sent",
    Closed = "Closed",
    Acknowledged = "Acknowledged",
    PartiallyReceived = "PartiallyReceived",
    Draft = "Draft",
    Received = "Received"
}
export interface backendInterface {
    createCustomer(c: Customer): Promise<bigint>;
    createCustomerEquipment(eq: CustomerEquipment): Promise<bigint>;
    createItem(name: string, description: string, unit: string): Promise<void>;
    createLocation(name: string, beltRequirements: Array<[string, bigint]>, filterRequirements: Array<[string, bigint]>): Promise<void>;
    createMaintenanceRecord(rec: MaintenanceRecord): Promise<bigint>;
    createPurchaseOrder(po: PurchaseOrder): Promise<bigint>;
    createReorderAlert(alert: ReorderAlert): Promise<bigint>;
    createServiceKit(sk: ServiceKit): Promise<bigint>;
    createSupplier(s: Supplier): Promise<bigint>;
    createTechnician(tech: Technician): Promise<bigint>;
    createTransaction(txn: Transaction): Promise<bigint>;
    createWorkOrder(wo: WorkOrder): Promise<bigint>;
    deleteCustomer(id: bigint): Promise<void>;
    deleteCustomerEquipment(id: bigint): Promise<void>;
    deleteGasketInfo(locationId: bigint): Promise<void>;
    deleteItem(id: bigint): Promise<void>;
    deleteLocation(id: bigint): Promise<void>;
    deletePurchaseOrder(id: bigint): Promise<void>;
    deleteServiceKit(id: bigint): Promise<void>;
    deleteSupplier(id: bigint): Promise<void>;
    deleteTechnician(id: bigint): Promise<void>;
    deleteUser(user: Principal): Promise<void>;
    deleteWorkOrder(id: bigint): Promise<void>;
    generateCustomReport(selectedLocationIds: Array<bigint>): Promise<CustomReport>;
    generateOrder(): Promise<Array<OrderItem>>;
    generateStagingReport(): Promise<Array<StagingReport>>;
    getActiveReorderAlerts(): Promise<Array<ReorderAlert>>;
    getAllActivityLogs(): Promise<Array<ActivityLog>>;
    getAllCustomerEquipments(): Promise<Array<CustomerEquipment>>;
    getAllCustomers(): Promise<Array<Customer>>;
    getAllGasketInfos(): Promise<Array<GasketInfo>>;
    getAllItems(): Promise<Array<Item>>;
    getAllLocations(): Promise<Array<Location>>;
    getAllMaintenanceRecords(): Promise<Array<MaintenanceRecord>>;
    getAllPurchaseOrders(): Promise<Array<PurchaseOrder>>;
    getAllReorderAlerts(): Promise<Array<ReorderAlert>>;
    getAllServiceKits(): Promise<Array<ServiceKit>>;
    getAllStockLevels(): Promise<Array<StockLevel>>;
    getAllSuppliers(): Promise<Array<Supplier>>;
    getAllTechnicians(): Promise<Array<Technician>>;
    getAllTransactions(): Promise<Array<Transaction>>;
    getAllWorkOrders(): Promise<Array<WorkOrder>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCustomer(id: bigint): Promise<Customer | null>;
    getCustomerEquipment(id: bigint): Promise<CustomerEquipment | null>;
    getCustomerEquipmentByCustomer(customerId: bigint): Promise<Array<CustomerEquipment>>;
    getLocationGasketInfo(locationId: bigint): Promise<GasketInfo | null>;
    getMaintenanceRecord(id: bigint): Promise<MaintenanceRecord | null>;
    getMaintenanceRecordsByEquipment(equipmentId: bigint): Promise<Array<MaintenanceRecord>>;
    getPurchaseOrder(id: bigint): Promise<PurchaseOrder | null>;
    getPurchaseOrdersBySupplier(supplierId: bigint): Promise<Array<PurchaseOrder>>;
    getServiceKit(id: bigint): Promise<ServiceKit | null>;
    getStockLevelByItemId(itemId: bigint): Promise<StockLevel | null>;
    getSupplier(id: bigint): Promise<Supplier | null>;
    getTechnician(id: bigint): Promise<Technician | null>;
    getTransaction(id: bigint): Promise<Transaction | null>;
    getTransactionsByItem(itemId: bigint): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWorkOrder(id: bigint): Promise<WorkOrder | null>;
    getWorkOrdersByCustomer(customerId: bigint): Promise<Array<WorkOrder>>;
    getWorkOrdersByTechnician(technicianId: bigint): Promise<Array<WorkOrder>>;
    listUsers(): Promise<Array<Principal>>;
    logActivity(action: string, entityType: string, entityId: bigint, details: string | null): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveLocationGasketInfo(locationId: bigint, gasketInfo: GasketInfo): Promise<void>;
    searchGasketLocations(searchTerm: string): Promise<Array<Location>>;
    searchLocations(searchTerm: string): Promise<Array<Location>>;
    seedAllData(): Promise<void>;
    updateCustomer(id: bigint, c: Customer): Promise<void>;
    updateCustomerEquipment(id: bigint, eq: CustomerEquipment): Promise<void>;
    updateItem(id: bigint, name: string, description: string, unit: string): Promise<void>;
    updateLocation(id: bigint, name: string, beltRequirements: Array<[string, bigint]>, filterRequirements: Array<[string, bigint]>): Promise<void>;
    updateLocationActiveStatus(id: bigint, active: boolean): Promise<void>;
    updateLocationCompletionStatus(id: bigint, completed: boolean): Promise<void>;
    updateMaintenanceRecord(id: bigint, rec: MaintenanceRecord): Promise<void>;
    updatePurchaseOrder(id: bigint, po: PurchaseOrder): Promise<void>;
    updateReorderAlertStatus(id: bigint, status: Variant_Ordered_Acknowledged_Active_Resolved): Promise<void>;
    updateServiceKit(id: bigint, sk: ServiceKit): Promise<void>;
    updateStockLevel(itemId: bigint, beginningInventory: bigint | null, receive1: bigint | null, receive2: bigint | null, receive3: bigint | null, currentStock: bigint | null): Promise<void>;
    updateSupplier(id: bigint, s: Supplier): Promise<void>;
    updateTechnician(id: bigint, tech: Technician): Promise<void>;
    updateWorkOrder(id: bigint, wo: WorkOrder): Promise<void>;
}
