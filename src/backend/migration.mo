import BaseToCore "BaseToCore";
import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // ── Shared types ─────────────────────────────────────────────────────────────

  type UserProfile = { name : Text };

  type UserRole = { #admin; #guest; #user };
  type ApprovalStatus = { #approved; #pending; #rejected };

  type MultiUserState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
    approvalStatus : Map.Map<Principal, ApprovalStatus>;
  };

  type GasketInfo = {
    locationId : Nat;
    cooler : Text;
    freezer : Text;
    fryFreezer : Text;
    glassFreezer : Text;
    outsideDressTable : Text;
    insideDress : Text;
    grillBox : Text;
  };

  type Location = {
    id : Nat;
    name : Text;
    locationType : { #Warehouse; #ServiceTruck; #JobSite; #SecondaryStorage };
    address : ?Text;
    zones : [Text];
    managerId : ?Nat;
    isActive : Bool;
    beltRequirements : [(Text, Nat)];
    filterRequirements : [(Text, Nat)];
    completed : Bool;
    active : Bool;
  };

  type Item = {
    id : Nat;
    name : Text;
    description : Text;
    unit : Text;
    sku : Text;
    category : Text;
    subcategory : Text;
    cost : Float;
    sellPrice : Float;
    unitOfMeasure : Text;
    barcode : ?Text;
    qrCode : ?Text;
    reorderPoint : Nat;
    maxStock : Nat;
    supplierIds : [Nat];
    variantOf : ?Nat;
    customFields : [(Text, Text)];
    isActive : Bool;
  };

  type StockLevel = {
    itemId : Nat;
    locationId : Nat;
    quantity : Nat;
    zone : ?Text;
    bin : ?Text;
    lastUpdated : Int;
    beginningInventory : ?Nat;
    receive1 : ?Nat;
    receive2 : ?Nat;
    receive3 : ?Nat;
    currentStock : ?Nat;
  };

  type Supplier = {
    id : Nat;
    name : Text;
    contactName : Text;
    email : Text;
    phone : Text;
    address : Text;
    website : ?Text;
    paymentTerms : Text;
    leadTimeDays : Nat;
    rating : Float;
    isActive : Bool;
  };

  type Customer = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    address : Text;
    city : Text;
    state : Text;
    zip : Text;
    equipmentList : [Nat];
    serviceHistory : [Nat];
    notes : ?Text;
  };

  type CustomerEquipment = {
    id : Nat;
    customerId : Nat;
    model : Text;
    serialNumber : Text;
    brand : Text;
    equipmentType : Text;
    purchaseDate : ?Int;
    warrantyExpiry : ?Int;
    installDate : ?Int;
    location : Text;
  };

  type WorkOrderPart = {
    partId : Nat;
    quantity : Nat;
    unitCost : Float;
    totalCost : Float;
  };

  type WorkOrder = {
    id : Nat;
    customerId : Nat;
    technicianId : Nat;
    title : Text;
    description : Text;
    status : { #Scheduled; #InProgress; #Completed; #Invoiced; #Cancelled };
    priority : { #Low; #Medium; #High; #Emergency };
    scheduledDate : Int;
    completedDate : ?Int;
    assignedParts : [WorkOrderPart];
    laborHours : Float;
    totalCost : Float;
    locationId : Nat;
    notes : ?Text;
  };

  type Transaction = {
    id : Nat;
    transactionType : { #Receipt; #Issued; #Returned; #Damaged; #Loss; #Adjustment; #Transfer };
    itemId : Nat;
    fromLocationId : ?Nat;
    toLocationId : ?Nat;
    quantity : Nat;
    userId : Principal;
    timestamp : Int;
    reason : Text;
    notes : ?Text;
    relatedOrderId : ?Nat;
  };

  type PurchaseOrderItem = {
    itemId : Nat;
    quantity : Nat;
    unitCost : Float;
    receivedQuantity : Nat;
    notes : ?Text;
  };

  type PurchaseOrder = {
    id : Nat;
    supplierId : Nat;
    status : { #Draft; #Sent; #Acknowledged; #PartiallyReceived; #Received; #Closed };
    items : [PurchaseOrderItem];
    totalCost : Float;
    createdDate : Int;
    expectedDate : ?Int;
    receivedDate : ?Int;
    notes : ?Text;
  };

  type ServiceKitPart = { partId : Nat; quantity : Nat };

  type ServiceKit = {
    id : Nat;
    name : Text;
    description : Text;
    category : Text;
    parts : [ServiceKitPart];
    totalCost : Float;
    estimatedLaborHours : Float;
  };

  type MaintenanceRecord = {
    id : Nat;
    equipmentId : Nat;
    equipmentType : Text;
    scheduledDate : Int;
    completedDate : ?Int;
    technicianId : Nat;
    workPerformed : Text;
    partsUsed : [WorkOrderPart];
    cost : Float;
    status : { #Scheduled; #InProgress; #Completed; #Overdue; #Cancelled };
    notes : ?Text;
  };

  type ReorderAlert = {
    id : Nat;
    itemId : Nat;
    locationId : Nat;
    currentStock : Nat;
    reorderPoint : Nat;
    suggestedQuantity : Nat;
    status : { #Active; #Acknowledged; #Ordered; #Resolved };
    createdDate : Int;
  };

  type Technician = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    role : Text;
    assignedTruckId : ?Nat;
    skills : [Text];
    isActive : Bool;
  };

  type ActivityLog = {
    id : Nat;
    userId : Principal;
    action : Text;
    entityType : Text;
    entityId : Nat;
    timestamp : Int;
    details : ?Text;
  };

  // ── OldActor: matches .old/src/backend/main.mo stable fields exactly ─────────
  // The old actor already uses mo:core/Map with the full new state shape.

  type OldActor = {
    var userProfiles : Map.Map<Principal, UserProfile>;
    var locations : Map.Map<Nat, Location>;
    var items : Map.Map<Nat, Item>;
    var stockLevels : Map.Map<Nat, StockLevel>;
    var gasketInfos : Map.Map<Nat, GasketInfo>;
    var nextLocationId : Nat;
    var nextItemId : Nat;
    var suppliers : Map.Map<Nat, Supplier>;
    var customers : Map.Map<Nat, Customer>;
    var customerEquipments : Map.Map<Nat, CustomerEquipment>;
    var workOrders : Map.Map<Nat, WorkOrder>;
    var transactions : Map.Map<Nat, Transaction>;
    var purchaseOrders : Map.Map<Nat, PurchaseOrder>;
    var serviceKits : Map.Map<Nat, ServiceKit>;
    var maintenanceRecords : Map.Map<Nat, MaintenanceRecord>;
    var reorderAlerts : Map.Map<Nat, ReorderAlert>;
    var technicians : Map.Map<Nat, Technician>;
    var activityLogs : Map.Map<Nat, ActivityLog>;
    var nextSupplierId : Nat;
    var nextCustomerId : Nat;
    var nextCustomerEquipmentId : Nat;
    var nextWorkOrderId : Nat;
    var nextTransactionId : Nat;
    var nextPurchaseOrderId : Nat;
    var nextServiceKitId : Nat;
    var nextMaintenanceRecordId : Nat;
    var nextReorderAlertId : Nat;
    var nextTechnicianId : Nat;
    var nextActivityLogId : Nat;
    var seedDataSeeded : Bool;
    multiUserState : MultiUserState;
  };

  // ── NewActor: identical to OldActor — pass-through migration ─────────────────

  type NewActor = {
    var userProfiles : Map.Map<Principal, UserProfile>;
    var locations : Map.Map<Nat, Location>;
    var items : Map.Map<Nat, Item>;
    var stockLevels : Map.Map<Nat, StockLevel>;
    var gasketInfos : Map.Map<Nat, GasketInfo>;
    var nextLocationId : Nat;
    var nextItemId : Nat;
    var suppliers : Map.Map<Nat, Supplier>;
    var customers : Map.Map<Nat, Customer>;
    var customerEquipments : Map.Map<Nat, CustomerEquipment>;
    var workOrders : Map.Map<Nat, WorkOrder>;
    var transactions : Map.Map<Nat, Transaction>;
    var purchaseOrders : Map.Map<Nat, PurchaseOrder>;
    var serviceKits : Map.Map<Nat, ServiceKit>;
    var maintenanceRecords : Map.Map<Nat, MaintenanceRecord>;
    var reorderAlerts : Map.Map<Nat, ReorderAlert>;
    var technicians : Map.Map<Nat, Technician>;
    var activityLogs : Map.Map<Nat, ActivityLog>;
    var nextSupplierId : Nat;
    var nextCustomerId : Nat;
    var nextCustomerEquipmentId : Nat;
    var nextWorkOrderId : Nat;
    var nextTransactionId : Nat;
    var nextPurchaseOrderId : Nat;
    var nextServiceKitId : Nat;
    var nextMaintenanceRecordId : Nat;
    var nextReorderAlertId : Nat;
    var nextTechnicianId : Nat;
    var nextActivityLogId : Nat;
    var seedDataSeeded : Bool;
    multiUserState : BaseToCore.NewMultiUserState;
  };

  // ── Pass-through migration ────────────────────────────────────────────────────
  // Old and new state shapes are identical; copy all fields directly.

  public func run(old : OldActor) : NewActor {
    {
      var userProfiles = old.userProfiles;
      var locations = old.locations;
      var items = old.items;
      var stockLevels = old.stockLevels;
      var gasketInfos = old.gasketInfos;
      var nextLocationId = old.nextLocationId;
      var nextItemId = old.nextItemId;
      var suppliers = old.suppliers;
      var customers = old.customers;
      var customerEquipments = old.customerEquipments;
      var workOrders = old.workOrders;
      var transactions = old.transactions;
      var purchaseOrders = old.purchaseOrders;
      var serviceKits = old.serviceKits;
      var maintenanceRecords = old.maintenanceRecords;
      var reorderAlerts = old.reorderAlerts;
      var technicians = old.technicians;
      var activityLogs = old.activityLogs;
      var nextSupplierId = old.nextSupplierId;
      var nextCustomerId = old.nextCustomerId;
      var nextCustomerEquipmentId = old.nextCustomerEquipmentId;
      var nextWorkOrderId = old.nextWorkOrderId;
      var nextTransactionId = old.nextTransactionId;
      var nextPurchaseOrderId = old.nextPurchaseOrderId;
      var nextServiceKitId = old.nextServiceKitId;
      var nextMaintenanceRecordId = old.nextMaintenanceRecordId;
      var nextReorderAlertId = old.nextReorderAlertId;
      var nextTechnicianId = old.nextTechnicianId;
      var nextActivityLogId = old.nextActivityLogId;
      var seedDataSeeded = old.seedDataSeeded;
      multiUserState = old.multiUserState;
    };
  };
};
