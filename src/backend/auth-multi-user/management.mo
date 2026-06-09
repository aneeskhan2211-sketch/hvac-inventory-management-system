import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";

module {
    public type UserRole = {
        #admin;
        #user;
        #guest;
    };

    public type ApprovalStatus = {
        #approved;
        #rejected;
        #pending;
    };

    public type MultiUserSystemState = {
        var adminAssigned : Bool;
        userRoles : Map.Map<Principal, UserRole>;
        approvalStatus : Map.Map<Principal, ApprovalStatus>;
    };

    public func initState() : MultiUserSystemState {
        {
            var adminAssigned = false;
            userRoles = Map.empty<Principal, UserRole>();
            approvalStatus = Map.empty<Principal, ApprovalStatus>();
        };
    };

    public func initializeAuth(state : MultiUserSystemState, caller : Principal) {
        if (not caller.isAnonymous()) {
            // Always set/refresh the user as admin and approved
            state.userRoles.add(caller, #admin);
            state.approvalStatus.add(caller, #approved);

            // Mark that at least one admin has been assigned
            if (not state.adminAssigned) {
                state.adminAssigned := true;
            };
        };
    };

    public func getApprovalStatus(state : MultiUserSystemState, caller : Principal) : ApprovalStatus {
        switch (state.approvalStatus.get(caller)) {
            case (?status) status;
            case null Runtime.trap("User is not registered");
        };
    };

    public func getUserRole(state : MultiUserSystemState, caller : Principal) : UserRole {
        if (caller.isAnonymous()) {
            #guest;
        } else {
            switch (state.userRoles.get(caller)) {
                case (?role) { role };
                case (null) {
                    Runtime.trap("User is not registered");
                };
            };
        };
    };

    public func hasPermission(state : MultiUserSystemState, caller : Principal, requiredRole : UserRole, requireApproval : Bool) : Bool {
        let role = getUserRole(state, caller);
        if (requireApproval) {
            let approval = getApprovalStatus(state, caller);
            if (approval != #approved) {
                return false;
            };
        };
        switch (role) {
            case (#admin) true;
            case (role) {
                switch (requiredRole) {
                    case (#admin) false;
                    case (#user) role == #user;
                    case (#guest) true;
                };
            };
        };
    };

    public func isAdmin(state : MultiUserSystemState, caller : Principal) : Bool {
        getUserRole(state, caller) == #admin;
    };

    public func assignRole(state : MultiUserSystemState, caller : Principal, user : Principal, newRole : UserRole) {
        if (not (hasPermission(state, caller, #admin, true))) {
            Runtime.trap("Unauthorized: Only admins can assign user roles");
        };
        state.userRoles.add(user, newRole);
    };

    public func setApproval(state : MultiUserSystemState, caller : Principal, user : Principal, approval : ApprovalStatus) {
        if (not (hasPermission(state, caller, #admin, true))) {
            Runtime.trap("Unauthorized: Only admins can approve users");
        };
        state.approvalStatus.add(user, approval);
    };

    public type UserInfo = {
        principal : Principal;
        role : UserRole;
        approval : ApprovalStatus;
    };

    public func listUsers(state : MultiUserSystemState, caller : Principal) : [UserInfo] {
        if (not (hasPermission(state, caller, #admin, true))) {
            Runtime.trap("Unauthorized: Only admins can list users");
        };
        let entries = state.userRoles.toArray();
        entries.map<(Principal, UserRole), UserInfo>(
            func((principal, role)) {
                let approval = getApprovalStatus(state, principal);
                { principal; role; approval };
            }
        );
    };
};
