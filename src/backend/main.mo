import Auth "auth-multi-user/management";
import Migration "migration";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import List "mo:core/List";

(with migration = Migration.run)
actor {

    public type UserProfile = {
        name : Text;
    };

    var userProfiles = Map.empty<Principal, UserProfile>();
    let multiUserState = Auth.initState();

    public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
        userProfiles.get(caller);
    };

    public query func getUserProfile(user : Principal) : async ?UserProfile {
        userProfiles.get(user);
    };

    public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
        userProfiles.add(caller, profile);
    };

    // ── Core Types ─────────────────────────────────────────────────────────────

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

    type OrderItem = {
        itemId : Nat;
        name : Text;
        quantity : Nat;
    };

    type StagingReport = {
        locationId : Nat;
        locationName : Text;
        items : [(Text, Nat)];
    };

    type CustomReport = {
        selectedLocations : [Location];
        combinedTotals : [(Text, Nat)];
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

    // ── Supplier Types ─────────────────────────────────────────────────────────

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

    // ── Customer Types ─────────────────────────────────────────────────────────

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

    // ── Work Order Types ───────────────────────────────────────────────────────

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

    // ── Transaction Types ──────────────────────────────────────────────────────

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

    // ── Purchase Order Types ───────────────────────────────────────────────────

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

    // ── Service Kit Types ──────────────────────────────────────────────────────

    type ServiceKitPart = {
        partId : Nat;
        quantity : Nat;
    };

    type ServiceKit = {
        id : Nat;
        name : Text;
        description : Text;
        category : Text;
        parts : [ServiceKitPart];
        totalCost : Float;
        estimatedLaborHours : Float;
    };

    // ── Maintenance Types ──────────────────────────────────────────────────────

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

    // ── Reorder Alert Types ────────────────────────────────────────────────────

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

    // ── Technician Types ───────────────────────────────────────────────────────

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

    // ── Activity Log Types ─────────────────────────────────────────────────────

    type ActivityLog = {
        id : Nat;
        userId : Principal;
        action : Text;
        entityType : Text;
        entityId : Nat;
        timestamp : Int;
        details : ?Text;
    };

    var locations = Map.empty<Nat, Location>();
    var items = Map.empty<Nat, Item>();
    var stockLevels = Map.empty<Nat, StockLevel>();
    var gasketInfos = Map.empty<Nat, GasketInfo>();

    // New state maps
    var suppliers = Map.empty<Nat, Supplier>();
    var customers = Map.empty<Nat, Customer>();
    var customerEquipments = Map.empty<Nat, CustomerEquipment>();
    var workOrders = Map.empty<Nat, WorkOrder>();
    var transactions = Map.empty<Nat, Transaction>();
    var purchaseOrders = Map.empty<Nat, PurchaseOrder>();
    var serviceKits = Map.empty<Nat, ServiceKit>();
    var maintenanceRecords = Map.empty<Nat, MaintenanceRecord>();
    var reorderAlerts = Map.empty<Nat, ReorderAlert>();
    var technicians = Map.empty<Nat, Technician>();
    var activityLogs = Map.empty<Nat, ActivityLog>();

    var nextLocationId : Nat = 0;
    var nextItemId : Nat = 0;
    var nextSupplierId : Nat = 0;
    var nextCustomerId : Nat = 0;
    var nextCustomerEquipmentId : Nat = 0;
    var nextWorkOrderId : Nat = 0;
    var nextTransactionId : Nat = 0;
    var nextPurchaseOrderId : Nat = 0;
    var nextServiceKitId : Nat = 0;
    var nextMaintenanceRecordId : Nat = 0;
    var nextReorderAlertId : Nat = 0;
    var nextTechnicianId : Nat = 0;
    var nextActivityLogId : Nat = 0;
    var seedDataSeeded : Bool = false;

    // ── Seed Data ──────────────────────────────────────────────────────────────

    func seedLocationsData() {
        let locs = [
            ("Main Warehouse", #Warehouse, "123 Industrial Blvd, Houston, TX 77001", ["Zone A", "Zone B", "Zone C"], true),
            ("North Service Center", #SecondaryStorage, "456 North Pkwy, Houston, TX 77002", ["Shelf 1", "Shelf 2"], true),
            ("South Branch", #Warehouse, "789 South Ave, Houston, TX 77003", ["Bay 1", "Bay 2"], true),
            ("Truck Unit 101", #ServiceTruck, "Mobile Unit", [], true),
            ("Truck Unit 102", #ServiceTruck, "Mobile Unit", [], true),
            ("Truck Unit 103", #ServiceTruck, "Mobile Unit", [], true),
            ("Downtown Job Site", #JobSite, "100 Main St, Houston, TX 77004", [], false),
            ("West Side Storage", #SecondaryStorage, "321 West Rd, Houston, TX 77005", ["Row A", "Row B"], true),
        ];
        for ((name, locType, addr, zones, active) in locs.vals()) {
            let loc : Location = {
                id = nextLocationId;
                name;
                locationType = locType;
                address = ?addr;
                zones;
                managerId = null;
                isActive = active;
                beltRequirements = [];
                filterRequirements = [];
                completed = false;
                active;
            };
            locations.add(nextLocationId, loc);
            nextLocationId += 1;
        };
    };

    func seedTechniciansData() {
        let techs = [
            ("Carlos Rivera", "carlos.r@hvac.com", "713-555-0101", "Senior Technician", ?1, ["HVAC Installation", "Refrigeration", "Electrical"]),
            ("Maria Santos", "maria.s@hvac.com", "713-555-0102", "HVAC Technician", ?2, ["AC Repair", "Maintenance", "Ductwork"]),
            ("James Whitfield", "james.w@hvac.com", "713-555-0103", "Senior Technician", ?3, ["Commercial HVAC", "Chillers", "BMS"]),
            ("Lisa Chen", "lisa.c@hvac.com", "713-555-0104", "Apprentice", ?4, ["AC Repair", "Filter Changes"]),
            ("Robert Okafor", "robert.o@hvac.com", "713-555-0105", "HVAC Technician", null, ["Refrigeration", "Compressors", "Heat Pumps"]),
            ("Sarah Thompson", "sarah.t@hvac.com", "713-555-0106", "Senior Technician", ?5, ["Commercial HVAC", "Boilers", "Controls"]),
            ("David Kim", "david.k@hvac.com", "713-555-0107", "HVAC Technician", null, ["Residential AC", "Mini-Splits", "Ductless Systems"]),
            ("Amanda Foster", "amanda.f@hvac.com", "713-555-0108", "Lead Technician", null, ["Industrial Cooling", "Data Center HVAC", "Precision Cooling"]),
            ("Marcus Johnson", "marcus.j@hvac.com", "713-555-0109", "Apprentice", null, ["AC Maintenance", "Filter Replacement"]),
            ("Patricia Nguyen", "patricia.n@hvac.com", "713-555-0110", "HVAC Technician", null, ["Heat Pumps", "Geothermal", "Zoning Systems"]),
            ("Tony Alvarez", "tony.a@hvac.com", "713-555-0111", "Senior Technician", null, ["Commercial Refrigeration", "Walk-in Coolers", "Ice Machines"]),
            ("Jennifer Walsh", "jennifer.w@hvac.com", "713-555-0112", "HVAC Technician", null, ["Ventilation", "Air Quality", "UV Systems"]),
        ];
        for ((name, email, phone, role, truckId, skills) in techs.vals()) {
            let tech : Technician = {
                id = nextTechnicianId;
                name;
                email;
                phone;
                role;
                assignedTruckId = truckId;
                skills;
                isActive = true;
            };
            technicians.add(nextTechnicianId, tech);
            nextTechnicianId += 1;
        };
    };

    func seedSuppliersData() {
        let sups = [
            ("Carrier HVAC Supply", "John Mitchell", "orders@carrierhvac.com", "1-800-555-0201", "1200 Carrier Way, Indianapolis, IN 46204", ?"www.carrier.com", "Net 30", 7, 4.8),
            ("Trane Parts Direct", "Susan Park", "supply@trane.com", "1-800-555-0202", "3600 Trane Blvd, La Crosse, WI 54601", ?"www.trane.com", "Net 30", 5, 4.7),
            ("Johnstone Supply", "Mike Reynolds", "houston@johnstone.com", "713-555-0203", "5500 Westheimer Rd, Houston, TX 77056", ?"www.johnstonesupply.com", "Net 15", 3, 4.6),
            ("Grainger Industrial", "Lisa Hoffman", "account@grainger.com", "1-800-555-0204", "100 Grainger Pkwy, Lake Forest, IL 60045", ?"www.grainger.com", "Net 30", 2, 4.5),
            ("Ferguson HVAC", "Tom Bradley", "hvac@ferguson.com", "713-555-0205", "2000 Ferguson Dr, Houston, TX 77001", ?"www.ferguson.com", "Net 30", 4, 4.4),
            ("Wesco International", "Anna Kim", "supply@wesco.com", "1-800-555-0206", "225 West Station Square, Pittsburgh, PA 15219", ?"www.wesco.com", "Net 45", 10, 4.3),
            ("Lennox Parts Center", "Chris Brown", "parts@lennox.com", "1-800-555-0207", "2140 Lake Park Blvd, Richardson, TX 75080", ?"www.lennox.com", "Net 30", 5, 4.6),
            ("Emerson Climate", "Rachel Davis", "climate@emerson.com", "1-800-555-0208", "1675 W Campbell Rd, Sidney, OH 45365", ?"www.emerson.com", "Net 60", 14, 4.2),
            ("Honeywell Home Pro", "Kevin Turner", "pro@honeywell.com", "1-800-555-0209", "1985 Douglas Dr N, Golden Valley, MN 55422", ?"www.honeywellhome.com", "Net 30", 7, 4.5),
            ("Texas HVAC Wholesalers", "Bob Hernandez", "sales@txhvac.com", "713-555-0210", "8800 Katy Fwy, Houston, TX 77024", null, "Net 15", 2, 4.7),
            ("United Refrigeration", "Diana Foster", "orders@uri.com", "713-555-0211", "6600 Southwest Fwy, Houston, TX 77074", ?"www.uri.com", "Net 30", 5, 4.4),
            ("Parker Hannifin HVAC", "Steve Collins", "hvac@parker.com", "1-800-555-0212", "6035 Parkland Blvd, Cleveland, OH 44124", ?"www.parker.com", "Net 45", 10, 4.3),
            ("Supco Components", "Nancy White", "orders@supco.com", "1-800-555-0213", "2230 Landmark Pl, Manasquan, NJ 08736", ?"www.supco.com", "Net 30", 7, 4.1),
            ("ICM Controls", "Gary Moore", "controls@icm.com", "1-800-555-0214", "7313 Williams Rd, Cicero, NY 13039", ?"www.icmcontrols.com", "Net 30", 5, 4.2),
            ("Diversified Heat Transfer", "Paula Garcia", "info@dht.com", "713-555-0215", "4400 Gulf Fwy, Houston, TX 77023", null, "Net 15", 3, 4.5),
        ];
        for ((name, contact, email, phone, addr, web, terms, lead, rating) in sups.vals()) {
            let sup : Supplier = {
                id = nextSupplierId;
                name;
                contactName = contact;
                email;
                phone;
                address = addr;
                website = web;
                paymentTerms = terms;
                leadTimeDays = lead;
                rating;
                isActive = true;
            };
            suppliers.add(nextSupplierId, sup);
            nextSupplierId += 1;
        };
    };

    func seedCustomersData() {
        let custs = [
            ("Greenfield Office Complex", "facilities@greenfield.com", "713-555-0301", "1 Greenfield Plaza", "Houston", "TX", "77002"),
            ("Sunrise Apartments LLC", "maintenance@sunriseapts.com", "713-555-0302", "500 Sunrise Blvd", "Houston", "TX", "77006"),
            ("Houston Medical Center", "engineering@hmc.org", "713-555-0303", "6565 Fannin St", "Houston", "TX", "77030"),
            ("Westchase Mall", "ops@westchasemall.com", "713-555-0304", "2600 Westchase Dr", "Houston", "TX", "77042"),
            ("Tom Anderson Residence", "tom.anderson@email.com", "713-555-0305", "123 Oak Lane", "Sugar Land", "TX", "77478"),
            ("River Oaks Restaurant Group", "chef@rorgroup.com", "713-555-0306", "3322 Westheimer Rd", "Houston", "TX", "77098"),
            ("Memorial Hermann Hospital", "plant.ops@memorialhermann.org", "713-555-0307", "6301 Memorial Dr", "Houston", "TX", "77007"),
            ("ExxonMobil Campus", "hvac.contracts@exxon.com", "281-555-0308", "22777 Springwoods Village Pkwy", "Spring", "TX", "77389"),
            ("Port Houston Authority", "maintenance@porthouston.com", "713-555-0309", "111 East Loop N", "Houston", "TX", "77029"),
            ("Garcia Family Home", "maria.garcia@gmail.com", "713-555-0310", "456 Pecan St", "Katy", "TX", "77450"),
            ("Lakewood Shopping Center", "ops@lakewoodshopping.com", "281-555-0311", "5755 E Sam Houston Pkwy", "Pasadena", "TX", "77505"),
            ("Houston ISD - Lincoln HS", "facilities@hisd.net", "713-555-0312", "6800 Wheatley St", "Houston", "TX", "77091"),
            ("Marriott Marquis Houston", "engineering@marriotthouston.com", "713-555-0313", "1777 Walker St", "Houston", "TX", "77010"),
            ("Shell Oil Refinery", "contractor.hvac@shell.com", "713-555-0314", "1 Shell Plaza", "Houston", "TX", "77002"),
            ("Patel Convenience Stores", "ravi.patel@patels.com", "281-555-0315", "9900 Beechnut St", "Houston", "TX", "77036"),
            ("Bayou City Brewery", "ops@bayoucitybrewery.com", "713-555-0316", "210 N Shepherd Dr", "Houston", "TX", "77007"),
            ("Champions Village HOA", "manager@championsvillage.com", "281-555-0317", "13333 Champions Dr", "Houston", "TX", "77069"),
            ("South Texas College of Law", "facilities@stcl.edu", "713-555-0318", "1303 San Jacinto St", "Houston", "TX", "77002"),
            ("Williams Office Building", "bob.williams@wob.com", "832-555-0319", "200 Bering Dr", "Houston", "TX", "77057"),
            ("Lone Star Data Center", "datacenter.ops@lsdc.com", "713-555-0320", "10800 Richmond Ave", "Houston", "TX", "77042"),
        ];
        for ((name, email, phone, addr, city, state, zip) in custs.vals()) {
            let cust : Customer = {
                id = nextCustomerId;
                name;
                email;
                phone;
                address = addr;
                city;
                state;
                zip;
                equipmentList = [];
                serviceHistory = [];
                notes = null;
            };
            customers.add(nextCustomerId, cust);
            nextCustomerId += 1;
        };
    };

    func seedItemsData() {
        let itemList = [
            ("Capacitor 45/5 MFD", "Dual run capacitor 45/5 MFD 440V round", "each", "CAP-4505-440", "Electrical", "Capacitors", 12.50, 28.99, 10, 50, [0, 2]),
            ("Capacitor 35/5 MFD", "Dual run capacitor 35/5 MFD 440V round", "each", "CAP-3505-440", "Electrical", "Capacitors", 11.00, 25.99, 10, 50, [0, 2]),
            ("Capacitor 55/5 MFD", "Dual run capacitor 55/5 MFD 440V round", "each", "CAP-5505-440", "Electrical", "Capacitors", 14.00, 32.99, 10, 50, [0, 2]),
            ("Contactor 30A Single Pole", "Single pole 30A contactor for AC units", "each", "CON-30A-1P", "Electrical", "Contactors", 8.50, 19.99, 8, 40, [0, 3]),
            ("Contactor 40A Double Pole", "Double pole 40A contactor for larger units", "each", "CON-40A-2P", "Electrical", "Contactors", 12.00, 27.99, 8, 40, [0, 3]),
            ("Condenser Fan Motor 1/5 HP", "Permanent split capacitor condenser fan motor 1/5 HP 825 RPM", "each", "MTR-FAN-015", "Motors", "Fan Motors", 45.00, 89.99, 5, 25, [0, 1]),
            ("Condenser Fan Motor 1/4 HP", "PSC condenser fan motor 1/4 HP 1075 RPM", "each", "MTR-FAN-025", "Motors", "Fan Motors", 52.00, 109.99, 5, 25, [0, 1]),
            ("Blower Motor 1/3 HP", "Multi-speed blower motor 1/3 HP", "each", "MTR-BLW-033", "Motors", "Blower Motors", 65.00, 129.99, 5, 20, [0, 1]),
            ("Blower Motor 1/2 HP", "Multi-speed blower motor 1/2 HP ECM", "each", "MTR-BLW-050", "Motors", "Blower Motors", 85.00, 169.99, 4, 15, [0, 1]),
            ("Compressor Scroll 3 Ton", "Copeland scroll compressor 36000 BTU R-410A", "each", "CMP-SCR-036", "Compressors", "Scroll", 380.00, 749.99, 2, 8, [0, 7]),
            ("Compressor Scroll 4 Ton", "Copeland scroll compressor 48000 BTU R-410A", "each", "CMP-SCR-048", "Compressors", "Scroll", 420.00, 849.99, 2, 8, [0, 7]),
            ("Compressor Scroll 5 Ton", "Copeland scroll compressor 60000 BTU R-410A", "each", "CMP-SCR-060", "Compressors", "Scroll", 480.00, 949.99, 1, 5, [0, 7]),
            ("Filter 16x20x1", "Fiberglass furnace filter 16x20x1 MERV 8", "each", "FLT-162001", "Filters", "Standard", 2.50, 6.99, 20, 100, [0, 2, 9]),
            ("Filter 16x25x1", "Fiberglass furnace filter 16x25x1 MERV 8", "each", "FLT-162501", "Filters", "Standard", 2.75, 7.49, 20, 100, [0, 2, 9]),
            ("Filter 20x20x1", "Pleated furnace filter 20x20x1 MERV 11", "each", "FLT-202001", "Filters", "Pleated", 4.00, 9.99, 20, 80, [0, 2, 9]),
            ("Filter 20x25x1", "Pleated furnace filter 20x25x1 MERV 11", "each", "FLT-202501", "Filters", "Pleated", 4.25, 10.49, 20, 80, [0, 2, 9]),
            ("Filter 24x24x1", "HEPA-style filter 24x24x1 MERV 13", "each", "FLT-242401", "Filters", "HEPA", 7.00, 16.99, 15, 60, [0, 9]),
            ("Refrigerant R-410A 25lb", "R-410A refrigerant cylinder 25 lbs", "cylinder", "REF-410A-25", "Refrigerants", "R-410A", 95.00, 195.00, 3, 15, [0, 10]),
            ("Refrigerant R-22 30lb", "R-22 refrigerant cylinder 30 lbs (legacy systems)", "cylinder", "REF-R22-30", "Refrigerants", "R-22", 280.00, 549.00, 2, 8, [0, 10]),
            ("Refrigerant R-32 25lb", "R-32 refrigerant cylinder 25 lbs", "cylinder", "REF-R32-25", "Refrigerants", "R-32", 88.00, 179.00, 2, 10, [0, 10]),
            ("Thermostat Honeywell T6", "Programmable thermostat 7-day Wi-Fi", "each", "THR-HON-T6", "Controls", "Thermostats", 38.00, 79.99, 5, 30, [0, 8]),
            ("Thermostat Ecobee Smart", "Smart thermostat with voice control", "each", "THR-ECO-SM", "Controls", "Thermostats", 125.00, 249.99, 3, 15, [0, 8]),
            ("Thermostat Nest Learning", "Google Nest Learning thermostat", "each", "THR-NST-LR", "Controls", "Thermostats", 150.00, 299.99, 3, 12, [0, 8]),
            ("TXV Valve R-410A 2 Ton", "Thermostatic expansion valve R-410A 2 ton", "each", "TXV-410-2T", "Valves", "Expansion", 28.00, 59.99, 5, 20, [0, 11]),
            ("TXV Valve R-410A 3 Ton", "Thermostatic expansion valve R-410A 3 ton", "each", "TXV-410-3T", "Valves", "Expansion", 32.00, 69.99, 5, 20, [0, 11]),
            ("Service Valve Ball 1/4", "Ball valve 1/4 inch sweat copper", "each", "VLV-BLL-025", "Valves", "Ball Valves", 4.50, 11.99, 15, 60, [0, 3]),
            ("Service Valve Ball 3/8", "Ball valve 3/8 inch sweat copper", "each", "VLV-BLL-038", "Valves", "Ball Valves", 5.50, 13.99, 15, 60, [0, 3]),
            ("UV Light Germicidal 24V", "UV-C germicidal lamp 24V for air handler", "each", "UVL-GMR-24V", "Air Quality", "UV Systems", 45.00, 99.99, 5, 20, [0, 11]),
            ("Condensate Pump 1/30 HP", "Mini condensate pump 1/30 HP 230V", "each", "PMP-CND-030", "Pumps", "Condensate", 32.00, 69.99, 5, 25, [0, 4]),
            ("Drain Pan Tablet 50ct", "Condensate pan treatment tablets 50 count", "bottle", "TBL-DRN-50C", "Chemicals", "Treatments", 8.00, 18.99, 10, 40, [0, 9]),
            ("Coil Cleaner Foaming 19oz", "Foaming AC coil cleaner 19 oz can", "can", "CLN-COL-19Z", "Chemicals", "Cleaners", 6.00, 13.99, 10, 50, [0, 9]),
            ("Duct Tape Foil 2in", "Foil duct tape 2 inch 50 yard roll", "roll", "TPE-DCT-2IN", "Supplies", "Tape", 7.50, 16.99, 8, 30, [0, 3]),
            ("Mastic Sealant Pail 1gal", "Water-based duct mastic sealant 1 gallon", "pail", "MST-DCT-1GL", "Supplies", "Sealants", 22.00, 44.99, 5, 15, [0, 3]),
            ("Insulation Pipe 1/2in x 6ft", "Foam pipe insulation 1/2 inch ID x 6 ft", "piece", "INS-PPE-050", "Insulation", "Pipe", 1.50, 3.99, 30, 100, [0, 4]),
            ("Insulation Pipe 3/4in x 6ft", "Foam pipe insulation 3/4 inch ID x 6 ft", "piece", "INS-PPE-075", "Insulation", "Pipe", 1.75, 4.49, 25, 80, [0, 4]),
            ("Hard Start Kit 3-2-1", "Hard start capacitor and relay kit for compressors", "each", "KIT-HST-321", "Electrical", "Kits", 18.00, 39.99, 8, 30, [0, 2]),
            ("Puron R-410A Leak Sealant", "AC leak sealant compatible with R-410A systems", "can", "LST-410A-LK", "Chemicals", "Sealants", 24.00, 49.99, 5, 20, [0, 10]),
            ("Disconnect Box 60A AC", "Non-fusible AC disconnect box 60A 240V", "each", "DSC-60A-NF", "Electrical", "Disconnect", 18.00, 39.99, 5, 25, [0, 2]),
            ("Line Set 3/8-3/4 in 25ft", "Copper line set 3/8 liquid 3/4 suction 25 ft pre-insulated", "set", "LNS-038-25F", "Copper", "Line Sets", 68.00, 139.99, 3, 10, [0, 4]),
            ("Gauge Set R-410A Manifold", "4-valve manifold gauge set for R-410A", "set", "GGS-410-4VL", "Tools", "Gauges", 85.00, 169.99, 2, 8, [0, 3]),
            ("Flushing Agent Rx-11", "System flushing agent 1 qt for refrigeration", "bottle", "FLS-RX11-1Q", "Chemicals", "Flush", 22.00, 46.99, 4, 15, [0, 10]),
            ("Motor Run Capacitor 10 MFD", "Motor run capacitor 10 MFD 370V oval", "each", "MRC-010-370", "Electrical", "Capacitors", 4.50, 10.99, 15, 60, [0, 2]),
            ("Motor Run Capacitor 15 MFD", "Motor run capacitor 15 MFD 370V oval", "each", "MRC-015-370", "Electrical", "Capacitors", 5.00, 11.99, 15, 60, [0, 2]),
            ("Belt 3/8 x 27", "V-belt for blower motor 3/8 x 27", "each", "BLT-038-027", "Belts", "V-Belt", 4.00, 9.99, 10, 40, [0, 6]),
            ("Belt 3/8 x 30", "V-belt for blower motor 3/8 x 30", "each", "BLT-038-030", "Belts", "V-Belt", 4.25, 10.49, 10, 40, [0, 6]),
            ("Belt 1/2 x 36", "V-belt for blower motor 1/2 x 36", "each", "BLT-050-036", "Belts", "V-Belt", 5.50, 12.99, 10, 35, [0, 6]),
            ("Relay 24V SPDT", "24V SPDT relay for HVAC controls", "each", "RLY-24V-SD", "Electrical", "Relays", 6.00, 13.99, 12, 50, [0, 2]),
            ("Transformer 40VA 24V", "Control transformer 40VA 240V primary 24V secondary", "each", "TRF-40VA-24", "Electrical", "Transformers", 18.00, 39.99, 8, 30, [0, 2]),
            ("Sensor Outdoor Temperature", "Outdoor ambient temperature sensor NTC", "each", "SNS-OAT-NTC", "Controls", "Sensors", 12.00, 26.99, 8, 30, [0, 8]),
            ("Pressure Switch High 400 PSI", "High pressure cutout switch 400 PSI SPST", "each", "PSW-HI-400", "Controls", "Pressure Switches", 14.00, 31.99, 8, 30, [0, 2]),
        ];
        let ts = 1749427200000000000;
        for ((name, desc, unit, sku, cat, subcat, cost, sell, reorder, maxs, supIds) in itemList.vals()) {
            let item : Item = {
                id = nextItemId;
                name;
                description = desc;
                unit;
                sku;
                category = cat;
                subcategory = subcat;
                cost;
                sellPrice = sell;
                unitOfMeasure = unit;
                barcode = null;
                qrCode = null;
                reorderPoint = reorder;
                maxStock = maxs;
                supplierIds = supIds;
                variantOf = null;
                customFields = [];
                isActive = true;
            };
            items.add(nextItemId, item);
            let sl : StockLevel = {
                itemId = nextItemId;
                locationId = 0;
                quantity = maxs / 2;
                zone = ?"Zone A";
                bin = null;
                lastUpdated = ts;
                beginningInventory = ?(maxs / 2);
                receive1 = null;
                receive2 = null;
                receive3 = null;
                currentStock = ?(maxs / 2);
            };
            stockLevels.add(nextItemId, sl);
            nextItemId += 1;
        };
    };

    func seedWorkOrdersData() {
        let ts : Int = 1749427200000000000;
        let day : Int = 86400000000000;
        let wos = [
            (0, 0, "AC System Replacement", "Full replacement of 5-ton commercial AC unit", #Completed, #High, -(15*day), ?-(5*day), 8.5, 3250.00),
            (1, 1, "Annual Preventive Maintenance", "Full system inspection and maintenance", #Completed, #Medium, -(30*day), ?-(28*day), 3.0, 425.00),
            (2, 2, "Chiller Overhaul", "Complete overhaul of 40-ton chiller unit", #InProgress, #High, -(2*day), null, 16.0, 8500.00),
            (3, 3, "Filter Replacement", "Quarterly filter replacement all units", #Completed, #Low, -(7*day), ?-(7*day), 2.0, 180.00),
            (4, 4, "Refrigerant Leak Repair", "Locate and repair refrigerant leak R-410A", #Completed, #High, -(10*day), ?-(9*day), 4.5, 680.00),
            (5, 5, "Thermostat Upgrade", "Replace old thermostats with smart Ecobee units", #Completed, #Low, -(20*day), ?-(19*day), 3.0, 580.00),
            (6, 6, "Emergency Compressor Failure", "Emergency replacement of failed scroll compressor", #Completed, #Emergency, -(3*day), ?-(2*day), 6.0, 1850.00),
            (7, 0, "Ductwork Inspection & Repair", "Inspect and seal duct system leaks", #Scheduled, #Medium, (2*day), null, 5.0, 750.00),
            (8, 1, "Condenser Coil Cleaning", "Clean and inspect condenser coils all units", #Scheduled, #Low, (3*day), null, 2.5, 320.00),
            (9, 2, "Control System Upgrade", "Upgrade building automation system", #InProgress, #High, -(1*day), null, 12.0, 4500.00),
            (10, 3, "New Installation 4-Ton", "Install new 4-ton split system", #Completed, #Medium, -(45*day), ?-(40*day), 8.0, 4200.00),
            (11, 4, "Gas Furnace Tune-Up", "Annual gas furnace inspection and tune-up", #Completed, #Medium, -(14*day), ?-(14*day), 2.5, 285.00),
            (12, 5, "Mini-Split Installation", "Install 2-zone ductless mini-split system", #Completed, #Medium, -(60*day), ?-(58*day), 6.0, 2800.00),
            (13, 6, "Boiler Service", "Annual boiler service and safety check", #Scheduled, #Medium, (5*day), null, 3.5, 450.00),
            (14, 7, "Heat Pump Service", "Inspect and service heat pump system", #Completed, #Low, -(8*day), ?-(8*day), 2.0, 240.00),
            (15, 8, "Emergency Thermostat", "Emergency thermostat replacement data center", #Completed, #Emergency, -(1*day), ?-(1*day), 1.5, 185.00),
            (16, 9, "Geothermal Checkup", "Annual geothermal system performance check", #Scheduled, #Low, (7*day), null, 4.0, 520.00),
            (17, 10, "Walk-in Cooler Repair", "Repair walk-in cooler refrigeration system", #InProgress, #High, 0, null, 5.0, 1200.00),
            (18, 11, "Ventilation System Clean", "Clean and balance ventilation system", #Completed, #Low, -(25*day), ?-(24*day), 4.0, 380.00),
            (19, 12, "Rooftop Unit Service", "Service 10-ton rooftop AC unit", #Scheduled, #Medium, (1*day), null, 3.5, 480.00),
            (0, 13, "Cooling Tower Maintenance", "Annual cooling tower maintenance", #Completed, #Medium, -(35*day), ?-(33*day), 6.0, 1100.00),
            (1, 14, "Air Handler Filter Change", "Monthly filter change air handlers", #Completed, #Low, -(5*day), ?-(5*day), 1.0, 95.00),
            (2, 15, "Chiller Chemical Treatment", "Apply chemical treatment to chiller loop", #Completed, #Medium, -(18*day), ?-(17*day), 2.5, 340.00),
            (3, 16, "Zone Controller Install", "Install new zone controller system", #Scheduled, #Medium, (10*day), null, 5.0, 890.00),
            (4, 17, "Evaporator Coil Replace", "Replace damaged evaporator coil 3-ton unit", #InProgress, #High, 0, null, 6.0, 1650.00),
            (5, 18, "Annual Service Contract", "Semi-annual full system service", #Completed, #Low, -(90*day), ?-(88*day), 8.0, 950.00),
            (6, 19, "Emergency Cooling Restore", "Restore cooling after power surge damage", #Completed, #Emergency, -(4*day), ?-(3*day), 7.0, 2100.00),
            (7, 0, "Refrigerant Recharge", "Recharge refrigerant on 2-ton system", #Completed, #Medium, -(12*day), ?-(12*day), 2.0, 380.00),
            (8, 1, "Noise Investigation", "Investigate unusual noise in condenser unit", #Completed, #Low, -(6*day), ?-(6*day), 1.5, 195.00),
            (9, 2, "Belt & Pulley Service", "Replace worn belts and pulleys blower units", #Scheduled, #Low, (4*day), null, 2.5, 285.00),
        ];
        for ((custId, techId, title, desc, status, prio, schedOffset, compOffsetOpt, labor, cost) in wos.vals()) {
            let wo : WorkOrder = {
                id = nextWorkOrderId;
                customerId = custId;
                technicianId = techId;
                title;
                description = desc;
                status;
                priority = prio;
                scheduledDate = ts + schedOffset;
                completedDate = switch (compOffsetOpt) {
                    case null null;
                    case (?offset) ?(ts + offset);
                };
                assignedParts = [];
                laborHours = labor;
                totalCost = cost;
                locationId = 0;
                notes = null;
            };
            workOrders.add(nextWorkOrderId, wo);
            nextWorkOrderId += 1;
        };
    };

    func seedPurchaseOrdersData() {
        let ts : Int = 1749427200000000000;
        let day : Int = 86400000000000;
        let pos = [
            (0, #Received, 1250.00, -(30*day), ?-(25*day), ?-(22*day)),
            (1, #Received, 876.50, -(45*day), ?-(40*day), ?-(38*day)),
            (2, #Sent, 445.00, -(5*day), ?(2*day), null),
            (3, #Acknowledged, 2200.00, -(3*day), ?(4*day), null),
            (4, #Closed, 3800.00, -(60*day), ?-(55*day), ?-(52*day)),
            (5, #PartiallyReceived, 680.00, -(15*day), ?-(8*day), null),
            (6, #Draft, 990.00, -(1*day), ?(7*day), null),
            (7, #Received, 540.00, -(20*day), ?-(15*day), ?-(14*day)),
            (8, #Sent, 1675.00, -(4*day), ?(3*day), null),
            (9, #Closed, 420.00, -(50*day), ?-(45*day), ?-(43*day)),
            (10, #Received, 880.00, -(25*day), ?-(20*day), ?-(18*day)),
            (11, #Acknowledged, 1320.00, -(2*day), ?(5*day), null),
            (12, #Draft, 550.00, 0, ?(10*day), null),
            (13, #Received, 740.00, -(35*day), ?-(30*day), ?-(28*day)),
            (14, #Sent, 860.00, -(6*day), ?(1*day), null),
        ];
        for ((supId, status, total, createOffset, expOffsetOpt, recOffsetOpt) in pos.vals()) {
            let po : PurchaseOrder = {
                id = nextPurchaseOrderId;
                supplierId = supId;
                status;
                items = [{ itemId = 0; quantity = 5; unitCost = total / 5.0; receivedQuantity = 5; notes = null }];
                totalCost = total;
                createdDate = ts + createOffset;
                expectedDate = switch (expOffsetOpt) { case null null; case (?off) ?(ts + off) };
                receivedDate = switch (recOffsetOpt) { case null null; case (?off) ?(ts + off) };
                notes = null;
            };
            purchaseOrders.add(nextPurchaseOrderId, po);
            nextPurchaseOrderId += 1;
        };
    };

    func seedTransactionsData() {
        let ts : Int = 1749427200000000000;
        let day : Int = 86400000000000;
        let txns = [
            (#Receipt, 0, null, ?0, 20, "Stock receipt from Carrier order"),
            (#Receipt, 1, null, ?0, 15, "Stock receipt from Carrier order"),
            (#Issued, 0, ?0, ?3, 2, "Issued for WO-001 compressor job"),
            (#Issued, 4, ?0, ?3, 1, "Issued for WO-002 contactor replacement"),
            (#Receipt, 12, null, ?0, 50, "Filter stock receipt Johnstone"),
            (#Receipt, 13, null, ?0, 50, "Filter stock receipt Johnstone"),
            (#Issued, 12, ?0, ?4, 10, "Issued for WO-003 filter changes"),
            (#Adjustment, 5, null, ?0, 3, "Inventory count adjustment"),
            (#Damaged, 9, ?0, null, 1, "Scroll compressor damaged in transit"),
            (#Receipt, 17, null, ?0, 5, "R-410A refrigerant receipt"),
            (#Issued, 17, ?0, ?4, 1, "Refrigerant issued for recharge job"),
            (#Returned, 3, ?4, ?0, 1, "Returned unused contactor from job site"),
            (#Receipt, 6, null, ?0, 8, "Fan motor receipt from Trane"),
            (#Issued, 6, ?0, ?5, 1, "Fan motor for condenser repair"),
            (#Transfer, 12, ?0, ?1, 20, "Filter transfer to north service center"),
            (#Receipt, 20, null, ?0, 10, "Thermostat receipt from Honeywell"),
            (#Issued, 20, ?0, ?4, 2, "Thermostats for upgrade job"),
            (#Adjustment, 0, null, ?0, 2, "Cycle count correction capacitors"),
            (#Loss, 18, ?0, null, 1, "UV light broken during handling"),
            (#Issued, 29, ?0, ?4, 5, "Drain tablets for maintenance kits"),
            (#Receipt, 7, null, ?0, 10, "Blower motor receipt"),
            (#Issued, 7, ?0, ?5, 1, "Blower motor for air handler job"),
            (#Receipt, 24, null, ?0, 20, "TXV valve receipt"),
            (#Transfer, 14, ?0, ?2, 15, "Filter transfer to south branch"),
            (#Issued, 9, ?0, ?3, 1, "Compressor issued for emergency job"),
            (#Receipt, 35, null, ?0, 20, "Hard start kit receipt"),
            (#Issued, 35, ?0, ?4, 3, "Hard start kits for residential jobs"),
            (#Receipt, 2, null, ?0, 25, "Capacitor 55/5 stock receipt"),
            (#Adjustment, 2, null, ?0, 1, "Variance correction after audit"),
            (#Issued, 44, ?0, ?5, 6, "Belts for blower service call"),
            (#Receipt, 48, null, ?0, 20, "Relay receipt from Ferguson"),
            (#Issued, 21, ?0, ?3, 1, "Ecobee thermostat for smart upgrade"),
            (#Issued, 30, ?0, ?5, 10, "Coil cleaner for maintenance day"),
            (#Receipt, 36, null, ?0, 15, "Disconnect box receipt"),
            (#Transfer, 17, ?0, ?3, 2, "Refrigerant transferred to truck"),
            (#Issued, 47, ?0, ?5, 3, "Relay replacements for controls job"),
            (#Receipt, 3, null, ?0, 30, "Single pole contactor receipt"),
            (#Issued, 8, ?0, ?3, 1, "1/2 HP blower motor issued"),
            (#Returned, 12, ?4, ?0, 5, "Unused filters returned to warehouse"),
            (#Receipt, 10, null, ?0, 4, "Compressor 4-ton receipt"),
            (#Issued, 10, ?0, ?4, 1, "4-ton compressor for replacement job"),
            (#Adjustment, 20, null, ?0, 1, "Thermostat overcount correction"),
            (#Receipt, 32, null, ?0, 20, "Duct tape receipt"),
            (#Issued, 23, ?0, ?3, 1, "TXV valve for evaporator job"),
            (#Issued, 38, ?0, ?5, 5, "Line set for new install"),
            (#Receipt, 49, null, ?0, 30, "High pressure switch receipt"),
            (#Issued, 49, ?0, ?4, 2, "Pressure switches for control work"),
            (#Receipt, 46, null, ?0, 25, "Motor run capacitors receipt"),
            (#Issued, 46, ?0, ?5, 3, "Run capacitors for motor service"),
            (#Loss, 11, ?0, null, 1, "5-ton compressor written off (damaged)"),
        ];
        var offset : Int = 0;
        for ((txType, itemId, fromLoc, toLoc, qty, reason) in txns.vals()) {
            let txn : Transaction = {
                id = nextTransactionId;
                transactionType = txType;
                itemId;
                fromLocationId = fromLoc;
                toLocationId = toLoc;
                quantity = qty;
                userId = Principal.fromText("2vxsx-fae");
                timestamp = ts - (offset * 3 * day / 50);
                reason;
                notes = null;
                relatedOrderId = null;
            };
            transactions.add(nextTransactionId, txn);
            nextTransactionId += 1;
            offset += 1;
        };
    };

    func seedServiceKitsData() {
        let kits = [
            ("Annual AC Tune-Up Kit", "Complete kit for annual AC preventive maintenance", "Maintenance",
              [(12, 4), (13, 4), (29, 1), (30, 2), (0, 1)], 35.50, 2.5),
            ("Emergency Compressor Kit", "Parts for emergency compressor replacement 3-ton", "Emergency",
              [(9, 1), (35, 1), (0, 1), (1, 2)], 425.00, 6.0),
            ("Filter Change Kit Residential", "Standard residential filter change kit", "Maintenance",
              [(12, 2), (13, 2), (29, 1)], 11.00, 0.5),
            ("Refrigerant Recharge Kit", "Parts and materials for refrigerant recharge", "Repair",
              [(17, 1), (36, 1), (37, 1)], 150.00, 2.0),
            ("Electrical Repair Kit", "Common electrical components for quick repairs", "Repair",
              [(0, 2), (1, 2), (3, 1), (35, 1), (47, 2)], 65.00, 3.0),
            ("Thermostat Upgrade Kit", "Smart thermostat upgrade package", "Upgrade",
              [(21, 1), (48, 1)], 145.00, 1.5),
            ("Fan Motor Service Kit", "Fan motor replacement with start components", "Repair",
              [(5, 1), (35, 1), (0, 1), (41, 1)], 120.00, 3.5),
            ("Seasonal Spring Startup Kit", "Spring startup and commissioning kit", "Seasonal",
              [(0, 2), (29, 1), (30, 2), (17, 1), (12, 4)], 145.00, 4.0),
        ];
        for ((name, desc, cat, parts, cost, labor) in kits.vals()) {
            let kitParts : [ServiceKitPart] = parts.map<(Nat, Nat), ServiceKitPart>(
                func(p) { { partId = p.0; quantity = p.1 } }
            );
            let kit : ServiceKit = {
                id = nextServiceKitId;
                name;
                description = desc;
                category = cat;
                parts = kitParts;
                totalCost = cost;
                estimatedLaborHours = labor;
            };
            serviceKits.add(nextServiceKitId, kit);
            nextServiceKitId += 1;
        };
    };

    func seedMaintenanceRecordsData() {
        let ts : Int = 1749427200000000000;
        let day : Int = 86400000000000;
        let recs = [
            (0, "Chiller", -(30*day), ?-(28*day), 0, "Full chiller service - replaced filters, checked refrigerant", 1200.00, #Completed),
            (1, "Split System", -(14*day), ?-(14*day), 1, "Annual tune-up, cleaned coils, replaced capacitor", 285.00, #Completed),
            (2, "Rooftop Unit", -(7*day), ?-(6*day), 2, "Quarterly maintenance, belt replaced, coils cleaned", 380.00, #Completed),
            (3, "Heat Pump", (7*day), null, 3, "Scheduled heat pump service", 0.00, #Scheduled),
            (4, "Boiler", -(90*day), ?-(88*day), 4, "Annual boiler inspection and cleaning", 580.00, #Completed),
            (5, "AHU", -(3*day), null, 5, "Replace filters and check belts air handling unit", 0.00, #InProgress),
            (6, "Condenser", -(45*day), ?-(43*day), 6, "Cleaned condenser coils, recharged refrigerant", 450.00, #Completed),
            (7, "Furnace", (14*day), null, 7, "Annual furnace inspection before heating season", 0.00, #Scheduled),
            (8, "Mini-Split", -(21*day), ?-(20*day), 8, "Cleaned filters, checked refrigerant level", 180.00, #Completed),
            (9, "Data Center CRAC", -(1*day), null, 9, "Monthly PM on precision cooling units", 0.00, #InProgress),
            (10, "Cooling Tower", -(60*day), ?-(58*day), 10, "Annual cooling tower clean and inspect", 1100.00, #Completed),
            (11, "Ice Machine", -(5*day), ?-(5*day), 11, "Cleaned ice machine, replaced water filter", 220.00, #Completed),
            (12, "Walk-in Cooler", (3*day), null, 0, "Quarterly cooler maintenance", 0.00, #Scheduled),
            (13, "Rooftop Unit", -(120*day), ?-(118*day), 1, "Semi-annual RTU service all units", 2200.00, #Completed),
            (14, "Geothermal", (21*day), null, 9, "Annual geothermal system inspection", 0.00, #Scheduled),
            (15, "Split System", -(8*day), ?-(8*day), 2, "Filter change and refrigerant check", 195.00, #Completed),
            (16, "VRF System", -(35*day), ?-(33*day), 3, "Quarterly VRF system maintenance all zones", 875.00, #Completed),
            (17, "Chiller", -(180*day), ?-(177*day), 4, "Semi-annual chiller tube cleaning", 3200.00, #Completed),
            (18, "Exhaust Fan", -(2*day), null, 5, "Replace exhaust fan motor and belt", 0.00, #InProgress),
            (19, "Ductless System", (5*day), null, 6, "Install new ductless system maintenance plan", 0.00, #Scheduled),
        ];
        for ((equipId, equipType, schedOffset, compOffsetOpt, techId, work, cost, status) in recs.vals()) {
            let rec : MaintenanceRecord = {
                id = nextMaintenanceRecordId;
                equipmentId = equipId;
                equipmentType = equipType;
                scheduledDate = ts + schedOffset;
                completedDate = switch (compOffsetOpt) { case null null; case (?off) ?(ts + off) };
                technicianId = techId;
                workPerformed = work;
                partsUsed = [];
                cost;
                status;
                notes = null;
            };
            maintenanceRecords.add(nextMaintenanceRecordId, rec);
            nextMaintenanceRecordId += 1;
        };
    };

    func seedReorderAlertsData() {
        let ts : Int = 1749427200000000000;
        let alerts = [
            (9, 0, 1, 2, 5, #Active),
            (10, 0, 1, 2, 4, #Active),
            (11, 0, 0, 1, 3, #Active),
            (5, 0, 3, 5, 8, #Acknowledged),
            (6, 0, 2, 5, 6, #Acknowledged),
            (17, 0, 2, 3, 6, #Active),
            (18, 0, 1, 2, 4, #Active),
            (7, 1, 4, 5, 8, #Active),
            (8, 1, 3, 4, 6, #Ordered),
            (0, 2, 8, 10, 15, #Resolved),
            (1, 2, 7, 10, 12, #Resolved),
            (4, 3, 5, 8, 10, #Active),
            (3, 0, 6, 8, 12, #Active),
            (20, 0, 2, 3, 6, #Ordered),
            (21, 0, 2, 3, 5, #Active),
            (35, 0, 6, 8, 15, #Active),
            (36, 0, 3, 5, 8, #Active),
            (22, 0, 2, 3, 4, #Acknowledged),
            (37, 2, 0, 2, 4, #Active),
            (38, 0, 2, 3, 5, #Active),
            (48, 0, 5, 8, 12, #Active),
            (49, 0, 6, 8, 10, #Active),
        ];
        for ((itemId, locId, stock, reorderPt, suggested, status) in alerts.vals()) {
            let alert : ReorderAlert = {
                id = nextReorderAlertId;
                itemId;
                locationId = locId;
                currentStock = stock;
                reorderPoint = reorderPt;
                suggestedQuantity = suggested;
                status;
                createdDate = ts;
            };
            reorderAlerts.add(nextReorderAlertId, alert);
            nextReorderAlertId += 1;
        };
    };

    public shared func seedAllData() : async () {
        if (seedDataSeeded) {
            return;
        };
        seedLocationsData();
        seedTechniciansData();
        seedSuppliersData();
        seedCustomersData();
        seedItemsData();
        seedWorkOrdersData();
        seedPurchaseOrdersData();
        seedTransactionsData();
        seedServiceKitsData();
        seedMaintenanceRecordsData();
        seedReorderAlertsData();
        seedDataSeeded := true;
    };

    // ── Supplier CRUD ──────────────────────────────────────────────────────────

    public query func getAllSuppliers() : async [Supplier] {
        suppliers.values().toArray();
    };

    public query func getSupplier(id : Nat) : async ?Supplier {
        suppliers.get(id);
    };

    public shared ({ caller }) func createSupplier(s : Supplier) : async Nat {
        ignore caller;
        let newId = nextSupplierId;
        suppliers.add(newId, { s with id = newId });
        nextSupplierId += 1;
        newId;
    };

    public shared ({ caller }) func updateSupplier(id : Nat, s : Supplier) : async () {
        ignore caller;
        suppliers.add(id, { s with id });
    };

    public shared ({ caller }) func deleteSupplier(id : Nat) : async () {
        ignore caller;
        suppliers.remove(id);
    };

    // ── Customer CRUD ──────────────────────────────────────────────────────────

    public query func getAllCustomers() : async [Customer] {
        customers.values().toArray();
    };

    public query func getCustomer(id : Nat) : async ?Customer {
        customers.get(id);
    };

    public shared ({ caller }) func createCustomer(c : Customer) : async Nat {
        ignore caller;
        let newId = nextCustomerId;
        customers.add(newId, { c with id = newId });
        nextCustomerId += 1;
        newId;
    };

    public shared ({ caller }) func updateCustomer(id : Nat, c : Customer) : async () {
        ignore caller;
        customers.add(id, { c with id });
    };

    public shared ({ caller }) func deleteCustomer(id : Nat) : async () {
        ignore caller;
        customers.remove(id);
    };

    // ── Customer Equipment CRUD ────────────────────────────────────────────────

    public query func getAllCustomerEquipments() : async [CustomerEquipment] {
        customerEquipments.values().toArray();
    };

    public query func getCustomerEquipment(id : Nat) : async ?CustomerEquipment {
        customerEquipments.get(id);
    };

    public query func getCustomerEquipmentByCustomer(customerId : Nat) : async [CustomerEquipment] {
        customerEquipments.values().filter(func(eq) { eq.customerId == customerId }).toArray();
    };

    public shared ({ caller }) func createCustomerEquipment(eq : CustomerEquipment) : async Nat {
        ignore caller;
        let newId = nextCustomerEquipmentId;
        customerEquipments.add(newId, { eq with id = newId });
        nextCustomerEquipmentId += 1;
        newId;
    };

    public shared ({ caller }) func updateCustomerEquipment(id : Nat, eq : CustomerEquipment) : async () {
        ignore caller;
        customerEquipments.add(id, { eq with id });
    };

    public shared ({ caller }) func deleteCustomerEquipment(id : Nat) : async () {
        ignore caller;
        customerEquipments.remove(id);
    };

    // ── Work Order CRUD ────────────────────────────────────────────────────────

    public query func getAllWorkOrders() : async [WorkOrder] {
        workOrders.values().toArray();
    };

    public query func getWorkOrder(id : Nat) : async ?WorkOrder {
        workOrders.get(id);
    };

    public query func getWorkOrdersByCustomer(customerId : Nat) : async [WorkOrder] {
        workOrders.values().filter(func(wo) { wo.customerId == customerId }).toArray();
    };

    public query func getWorkOrdersByTechnician(technicianId : Nat) : async [WorkOrder] {
        workOrders.values().filter(func(wo) { wo.technicianId == technicianId }).toArray();
    };

    public shared ({ caller }) func createWorkOrder(wo : WorkOrder) : async Nat {
        ignore caller;
        let newId = nextWorkOrderId;
        workOrders.add(newId, { wo with id = newId });
        nextWorkOrderId += 1;
        newId;
    };

    public shared ({ caller }) func updateWorkOrder(id : Nat, wo : WorkOrder) : async () {
        ignore caller;
        workOrders.add(id, { wo with id });
    };

    public shared ({ caller }) func deleteWorkOrder(id : Nat) : async () {
        ignore caller;
        workOrders.remove(id);
    };

    // ── Transaction CRUD ───────────────────────────────────────────────────────

    public query func getAllTransactions() : async [Transaction] {
        transactions.values().toArray();
    };

    public query func getTransaction(id : Nat) : async ?Transaction {
        transactions.get(id);
    };

    public query func getTransactionsByItem(itemId : Nat) : async [Transaction] {
        transactions.values().filter(func(txn) { txn.itemId == itemId }).toArray();
    };

    public shared ({ caller }) func createTransaction(txn : Transaction) : async Nat {
        ignore caller;
        let newId = nextTransactionId;
        transactions.add(newId, { txn with id = newId });
        nextTransactionId += 1;
        newId;
    };

    // ── Purchase Order CRUD ────────────────────────────────────────────────────

    public query func getAllPurchaseOrders() : async [PurchaseOrder] {
        purchaseOrders.values().toArray();
    };

    public query func getPurchaseOrder(id : Nat) : async ?PurchaseOrder {
        purchaseOrders.get(id);
    };

    public query func getPurchaseOrdersBySupplier(supplierId : Nat) : async [PurchaseOrder] {
        purchaseOrders.values().filter(func(po) { po.supplierId == supplierId }).toArray();
    };

    public shared ({ caller }) func createPurchaseOrder(po : PurchaseOrder) : async Nat {
        ignore caller;
        let newId = nextPurchaseOrderId;
        purchaseOrders.add(newId, { po with id = newId });
        nextPurchaseOrderId += 1;
        newId;
    };

    public shared ({ caller }) func updatePurchaseOrder(id : Nat, po : PurchaseOrder) : async () {
        ignore caller;
        purchaseOrders.add(id, { po with id });
    };

    public shared ({ caller }) func deletePurchaseOrder(id : Nat) : async () {
        ignore caller;
        purchaseOrders.remove(id);
    };

    // ── Service Kit CRUD ───────────────────────────────────────────────────────

    public query func getAllServiceKits() : async [ServiceKit] {
        serviceKits.values().toArray();
    };

    public query func getServiceKit(id : Nat) : async ?ServiceKit {
        serviceKits.get(id);
    };

    public shared ({ caller }) func createServiceKit(sk : ServiceKit) : async Nat {
        ignore caller;
        let newId = nextServiceKitId;
        serviceKits.add(newId, { sk with id = newId });
        nextServiceKitId += 1;
        newId;
    };

    public shared ({ caller }) func updateServiceKit(id : Nat, sk : ServiceKit) : async () {
        ignore caller;
        serviceKits.add(id, { sk with id });
    };

    public shared ({ caller }) func deleteServiceKit(id : Nat) : async () {
        ignore caller;
        serviceKits.remove(id);
    };

    // ── Maintenance Record CRUD ────────────────────────────────────────────────

    public query func getAllMaintenanceRecords() : async [MaintenanceRecord] {
        maintenanceRecords.values().toArray();
    };

    public query func getMaintenanceRecord(id : Nat) : async ?MaintenanceRecord {
        maintenanceRecords.get(id);
    };

    public query func getMaintenanceRecordsByEquipment(equipmentId : Nat) : async [MaintenanceRecord] {
        maintenanceRecords.values().filter(func(rec) { rec.equipmentId == equipmentId }).toArray();
    };

    public shared ({ caller }) func createMaintenanceRecord(rec : MaintenanceRecord) : async Nat {
        ignore caller;
        let newId = nextMaintenanceRecordId;
        maintenanceRecords.add(newId, { rec with id = newId });
        nextMaintenanceRecordId += 1;
        newId;
    };

    public shared ({ caller }) func updateMaintenanceRecord(id : Nat, rec : MaintenanceRecord) : async () {
        ignore caller;
        maintenanceRecords.add(id, { rec with id });
    };

    // ── Reorder Alert CRUD ─────────────────────────────────────────────────────

    public query func getAllReorderAlerts() : async [ReorderAlert] {
        reorderAlerts.values().toArray();
    };

    public query func getActiveReorderAlerts() : async [ReorderAlert] {
        reorderAlerts.values().filter(func(alert) { alert.status == #Active }).toArray();
    };

    public shared ({ caller }) func createReorderAlert(alert : ReorderAlert) : async Nat {
        ignore caller;
        let newId = nextReorderAlertId;
        reorderAlerts.add(newId, { alert with id = newId });
        nextReorderAlertId += 1;
        newId;
    };

    public shared ({ caller }) func updateReorderAlertStatus(id : Nat, status : { #Active; #Acknowledged; #Ordered; #Resolved }) : async () {
        ignore caller;
        switch (reorderAlerts.get(id)) {
            case null {};
            case (?alert) { reorderAlerts.add(id, { alert with status }) };
        };
    };

    // ── Technician CRUD ────────────────────────────────────────────────────────

    public query func getAllTechnicians() : async [Technician] {
        technicians.values().toArray();
    };

    public query func getTechnician(id : Nat) : async ?Technician {
        technicians.get(id);
    };

    public shared ({ caller }) func createTechnician(tech : Technician) : async Nat {
        ignore caller;
        let newId = nextTechnicianId;
        technicians.add(newId, { tech with id = newId });
        nextTechnicianId += 1;
        newId;
    };

    public shared ({ caller }) func updateTechnician(id : Nat, tech : Technician) : async () {
        ignore caller;
        technicians.add(id, { tech with id });
    };

    public shared ({ caller }) func deleteTechnician(id : Nat) : async () {
        ignore caller;
        technicians.remove(id);
    };

    // ── Activity Log ───────────────────────────────────────────────────────────

    public query func getAllActivityLogs() : async [ActivityLog] {
        activityLogs.values().toArray();
    };

    public shared func logActivity(action : Text, entityType : Text, entityId : Nat, details : ?Text) : async () {
        let log : ActivityLog = {
            id = nextActivityLogId;
            userId = Principal.fromText("2vxsx-fae");
            action;
            entityType;
            entityId;
            timestamp = 0;
            details;
        };
        activityLogs.add(nextActivityLogId, log);
        nextActivityLogId += 1;
    };

    // ── Internal helper functions ──────────────────────────────────────────────

    func itemExists(name : Text) : Bool {
        for (item in items.values()) {
            if (item.name == name) {
                return true;
            };
        };
        false;
    };

    func createItemIfNotExists(name : Text, description : Text, unit : Text) {
        if (not itemExists(name)) {
            let item : Item = {
                id = nextItemId;
                name;
                description;
                unit;
                sku = "SKU-" # nextItemId.toText();
                category = "General";
                subcategory = "";
                cost = 0.0;
                sellPrice = 0.0;
                unitOfMeasure = unit;
                barcode = null;
                qrCode = null;
                reorderPoint = 5;
                maxStock = 50;
                supplierIds = [];
                variantOf = null;
                customFields = [];
                isActive = true;
            };
            items.add(nextItemId, item);
            nextItemId += 1;
        };
    };

    func findItemByName(name : Text) : ?Item {
        for (item in items.values()) {
            if (item.name == name) {
                return ?item;
            };
        };
        null;
    };

    func getCurrentStock(itemId : Nat) : Nat {
        switch (stockLevels.get(itemId)) {
            case null 0;
            case (?stock) switch (stock.currentStock) {
                case null stock.quantity;
                case (?value) value;
            };
        };
    };

    func updateStock(itemId : Nat, newQuantity : Nat) {
        let existing = stockLevels.get(itemId);
        let stockLevel : StockLevel = switch (existing) {
            case null {
                {
                    itemId;
                    locationId = 0;
                    quantity = newQuantity;
                    zone = null;
                    bin = null;
                    lastUpdated = 0;
                    beginningInventory = null;
                    receive1 = null;
                    receive2 = null;
                    receive3 = null;
                    currentStock = ?newQuantity;
                };
            };
            case (?sl) {
                { sl with quantity = newQuantity; currentStock = ?newQuantity; lastUpdated = 0 };
            };
        };
        stockLevels.add(itemId, stockLevel);
    };

    public query func listUsers() : async [Principal] {
        userProfiles.keys().toArray();
    };

    public shared func deleteUser(user : Principal) : async () {
        userProfiles.remove(user);
    };

    public shared func createLocation(name : Text, beltRequirements : [(Text, Nat)], filterRequirements : [(Text, Nat)]) : async () {
        for ((beltSize, _) in beltRequirements.vals()) {
            let itemName = "Belt " # beltSize;
            createItemIfNotExists(itemName, "Belt size " # beltSize, "each");
        };

        for ((filterSize, _) in filterRequirements.vals()) {
            let itemName = "Filter " # filterSize;
            createItemIfNotExists(itemName, "Filter size " # filterSize, "each");
        };

        let location : Location = {
            id = nextLocationId;
            name;
            locationType = #Warehouse;
            address = null;
            zones = [];
            managerId = null;
            isActive = true;
            beltRequirements;
            filterRequirements;
            completed = false;
            active = true;
        };
        locations.add(nextLocationId, location);
        nextLocationId += 1;
    };

    public shared func updateLocation(id : Nat, name : Text, beltRequirements : [(Text, Nat)], filterRequirements : [(Text, Nat)]) : async () {
        switch (locations.get(id)) {
            case null {
                Runtime.trap("Location not found");
            };
            case (?existingLocation) {
                for ((beltSize, _) in beltRequirements.vals()) {
                    let itemName = "Belt " # beltSize;
                    createItemIfNotExists(itemName, "Belt size " # beltSize, "each");
                };

                for ((filterSize, _) in filterRequirements.vals()) {
                    let itemName = "Filter " # filterSize;
                    createItemIfNotExists(itemName, "Filter size " # filterSize, "each");
                };

                let location : Location = {
                    id;
                    name;
                    locationType = existingLocation.locationType;
                    address = existingLocation.address;
                    zones = existingLocation.zones;
                    managerId = existingLocation.managerId;
                    isActive = existingLocation.isActive;
                    beltRequirements;
                    filterRequirements;
                    completed = existingLocation.completed;
                    active = existingLocation.active;
                };
                locations.add(id, location);
            };
        };
    };

    public shared func deleteLocation(id : Nat) : async () {
        locations.remove(id);
    };

    public query func getAllLocations() : async [Location] {
        locations.values().toArray();
    };

    public query func searchLocations(searchTerm : Text) : async [Location] {
        let lowerSearchTerm = searchTerm.toLower();

        let matchingLocations = locations.values().filter(func(location) {
            location.name.toLower().contains(#text lowerSearchTerm)
        }).toArray();

        matchingLocations;
    };

    public shared func updateLocationCompletionStatus(id : Nat, completed : Bool) : async () {
        switch (locations.get(id)) {
            case null {
                Runtime.trap("Location not found");
            };
            case (?location) {
                if (completed and not location.completed) {
                    var insufficientParts : Text = "";
                    var insufficientCount : Nat = 0;

                    for ((beltSize, requiredQty) in location.beltRequirements.vals()) {
                        let itemName = "Belt " # beltSize;
                        switch (findItemByName(itemName)) {
                            case null {
                                if (insufficientCount > 0) { insufficientParts := insufficientParts # ", " };
                                insufficientParts := insufficientParts # (itemName # " (item not found)");
                                insufficientCount += 1;
                            };
                            case (?item) {
                                let currentStock = getCurrentStock(item.id);
                                if (currentStock < requiredQty) {
                                    if (insufficientCount > 0) { insufficientParts := insufficientParts # ", " };
                                    insufficientParts := insufficientParts # (itemName # " (need " # requiredQty.toText() # ", have " # currentStock.toText() # ")");
                                    insufficientCount += 1;
                                };
                            };
                        };
                    };

                    for ((filterSize, requiredQty) in location.filterRequirements.vals()) {
                        let itemName = "Filter " # filterSize;
                        switch (findItemByName(itemName)) {
                            case null {
                                if (insufficientCount > 0) { insufficientParts := insufficientParts # ", " };
                                insufficientParts := insufficientParts # (itemName # " (item not found)");
                                insufficientCount += 1;
                            };
                            case (?item) {
                                let currentStock = getCurrentStock(item.id);
                                if (currentStock < requiredQty) {
                                    if (insufficientCount > 0) { insufficientParts := insufficientParts # ", " };
                                    insufficientParts := insufficientParts # (itemName # " (need " # requiredQty.toText() # ", have " # currentStock.toText() # ")");
                                    insufficientCount += 1;
                                };
                            };
                        };
                    };

                    if (insufficientCount > 0) {
                        Runtime.trap("Insufficient inventory for the following items: " # insufficientParts);
                    };

                    for ((beltSize, requiredQty) in location.beltRequirements.vals()) {
                        let itemName = "Belt " # beltSize;
                        switch (findItemByName(itemName)) {
                            case null {
                                Runtime.trap("Item not found during deduction: " # itemName);
                            };
                            case (?item) {
                                let currentStock = getCurrentStock(item.id);
                                let newStock : Nat = if (currentStock >= requiredQty) {
                                    currentStock - requiredQty;
                                } else {
                                    Runtime.trap("Insufficient stock during deduction for: " # itemName);
                                };
                                updateStock(item.id, newStock);
                            };
                        };
                    };

                    for ((filterSize, requiredQty) in location.filterRequirements.vals()) {
                        let itemName = "Filter " # filterSize;
                        switch (findItemByName(itemName)) {
                            case null {
                                Runtime.trap("Item not found during deduction: " # itemName);
                            };
                            case (?item) {
                                let currentStock = getCurrentStock(item.id);
                                let newStock : Nat = if (currentStock >= requiredQty) {
                                    currentStock - requiredQty;
                                } else {
                                    Runtime.trap("Insufficient stock during deduction for: " # itemName);
                                };
                                updateStock(item.id, newStock);
                            };
                        };
                    };
                };

                let updatedLocation : Location = {
                    location with completed
                };
                locations.add(id, updatedLocation);
            };
        };
    };

    public shared func updateLocationActiveStatus(id : Nat, active : Bool) : async () {
        switch (locations.get(id)) {
            case null {
                Runtime.trap("Location not found");
            };
            case (?location) {
                let updatedLocation : Location = {
                    location with active
                };
                locations.add(id, updatedLocation);
            };
        };
    };

    public shared func createItem(name : Text, description : Text, unit : Text) : async () {
        let item : Item = {
            id = nextItemId;
            name;
            description;
            unit;
            sku = "SKU-" # nextItemId.toText();
            category = "General";
            subcategory = "";
            cost = 0.0;
            sellPrice = 0.0;
            unitOfMeasure = unit;
            barcode = null;
            qrCode = null;
            reorderPoint = 5;
            maxStock = 50;
            supplierIds = [];
            variantOf = null;
            customFields = [];
            isActive = true;
        };
        items.add(nextItemId, item);
        nextItemId += 1;
    };

    public shared func updateItem(id : Nat, name : Text, description : Text, unit : Text) : async () {
        switch (items.get(id)) {
            case null {
                let item : Item = {
                    id;
                    name;
                    description;
                    unit;
                    sku = "SKU-" # id.toText();
                    category = "General";
                    subcategory = "";
                    cost = 0.0;
                    sellPrice = 0.0;
                    unitOfMeasure = unit;
                    barcode = null;
                    qrCode = null;
                    reorderPoint = 5;
                    maxStock = 50;
                    supplierIds = [];
                    variantOf = null;
                    customFields = [];
                    isActive = true;
                };
                items.add(id, item);
            };
            case (?existing) {
                items.add(id, { existing with name; description; unit; unitOfMeasure = unit });
            };
        };
    };

    public shared func deleteItem(id : Nat) : async () {
        items.remove(id);
    };

    public query func getAllItems() : async [Item] {
        items.values().toArray();
    };

    public shared func updateStockLevel(itemId : Nat, beginningInventory : ?Nat, receive1 : ?Nat, receive2 : ?Nat, receive3 : ?Nat, currentStock : ?Nat) : async () {
        let qty = switch (currentStock) { case null 0; case (?v) v };
        let stockLevel : StockLevel = {
            itemId;
            locationId = 0;
            quantity = qty;
            zone = null;
            bin = null;
            lastUpdated = 0;
            beginningInventory;
            receive1;
            receive2;
            receive3;
            currentStock;
        };
        stockLevels.add(itemId, stockLevel);
    };

    public query func getAllStockLevels() : async [StockLevel] {
        stockLevels.values().toArray();
    };

    public query func getStockLevelByItemId(itemId : Nat) : async ?StockLevel {
        stockLevels.get(itemId);
    };

    public shared func generateOrder() : async [OrderItem] {

        let totalRequirements = Map.empty<Text, Nat>();

        for (location in locations.values()) {
            if (location.active) {
                for ((beltSize, quantity) in location.beltRequirements.vals()) {
                    let itemName = "Belt " # beltSize;
                    let currentTotal = switch (totalRequirements.get(itemName)) {
                        case null 0;
                        case (?existing) existing;
                    };
                    totalRequirements.add(itemName, currentTotal + quantity);
                };

                for ((filterSize, quantity) in location.filterRequirements.vals()) {
                    let itemName = "Filter " # filterSize;
                    let currentTotal = switch (totalRequirements.get(itemName)) {
                        case null 0;
                        case (?existing) existing;
                    };
                    totalRequirements.add(itemName, currentTotal + quantity);
                };
            };
        };

        for (stock in stockLevels.values()) {
            switch (items.get(stock.itemId)) {
                case null {};
                case (?item) {
                    switch (totalRequirements.get(item.name)) {
                        case null {};
                        case (?required) {
                            let availableInventory = (
                                (switch (stock.beginningInventory) {
                                    case null 0;
                                    case (?value) value;
                                }) +
                                (switch (stock.receive1) {
                                    case null 0;
                                    case (?value) value;
                                }) +
                                (switch (stock.receive2) {
                                    case null 0;
                                    case (?value) value;
                                }) +
                                (switch (stock.receive3) {
                                    case null 0;
                                    case (?value) value;
                                }) +
                                (switch (stock.currentStock) {
                                    case null 0;
                                    case (?value) value;
                                })
                            );
                            if (availableInventory >= required) {
                                totalRequirements.remove(item.name);
                            } else {
                                totalRequirements.add(item.name, (required - availableInventory : Nat));
                            };
                        };
                    };
                };
            };
        };

        var orderList = List.empty<OrderItem>();
        for ((name, quantity) in totalRequirements.entries()) {
            if (quantity > 0) {
                for (item in items.values()) {
                    if (item.name == name) {
                        orderList.add({ itemId = item.id; name; quantity });
                    };
                };
            };
        };

        orderList.toArray();
    };

    public shared func generateStagingReport() : async [StagingReport] {
        var reportList = List.empty<StagingReport>();
        for (location in locations.values()) {
            if (location.active) {
                var stagingList = List.empty<(Text, Nat)>();

                for ((beltSize, quantity) in location.beltRequirements.vals()) {
                    stagingList.add(("Belt " # beltSize, quantity));
                };

                for ((filterSize, quantity) in location.filterRequirements.vals()) {
                    stagingList.add(("Filter " # filterSize, quantity));
                };

                reportList.add({
                    locationId = location.id;
                    locationName = location.name;
                    items = stagingList.toArray();
                });
            };
        };

        reportList.toArray();
    };

    public shared func generateCustomReport(selectedLocationIds : [Nat]) : async CustomReport {
        let totalRequirements = Map.empty<Text, Nat>();

        var selectedLocationList = List.empty<Location>();
        for (id in selectedLocationIds.vals()) {
            switch (locations.get(id)) {
                case null {};
                case (?location) {
                    selectedLocationList.add(location);

                    for ((beltSize, quantity) in location.beltRequirements.vals()) {
                        let itemName = "Belt " # beltSize;
                        let currentTotal = switch (totalRequirements.get(itemName)) {
                            case null 0;
                            case (?existing) existing;
                        };
                        totalRequirements.add(itemName, currentTotal + quantity);
                    };

                    for ((filterSize, quantity) in location.filterRequirements.vals()) {
                        let itemName = "Filter " # filterSize;
                        let currentTotal = switch (totalRequirements.get(itemName)) {
                            case null 0;
                            case (?existing) existing;
                        };
                        totalRequirements.add(itemName, currentTotal + quantity);
                    };
                };
            };
        };

        let combinedTotals = totalRequirements.entries().toArray();

        {
            selectedLocations = selectedLocationList.toArray();
            combinedTotals;
        };
    };

    public shared func saveLocationGasketInfo(locationId : Nat, gasketInfo : GasketInfo) : async () {
        switch (locations.get(locationId)) {
            case null {
                Runtime.trap("Location not found");
            };
            case (?_) {
                gasketInfos.add(locationId, gasketInfo);
            };
        };
    };

    public query func getLocationGasketInfo(locationId : Nat) : async ?GasketInfo {
        gasketInfos.get(locationId);
    };

    public query func getAllGasketInfos() : async [GasketInfo] {
        gasketInfos.values().toArray();
    };

    public shared func deleteGasketInfo(locationId : Nat) : async () {
        gasketInfos.remove(locationId);
    };

    public query func searchGasketLocations(searchTerm : Text) : async [Location] {
        let lowerSearchTerm = searchTerm.toLower();

        let matchingLocations = locations.values().filter(func(location) {
            location.name.toLower().contains(#text lowerSearchTerm)
        }).toArray();

        matchingLocations;
    };
};
