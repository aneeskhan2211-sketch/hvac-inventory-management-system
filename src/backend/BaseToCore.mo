import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import OrderedMap "mo:base/OrderedMap";
import OrderedSet "mo:base/OrderedSet";
import ListBase "mo:base/List";

module {
  public func migrateOrderedMap<K, V>(old : OrderedMap.Map<K, V>, compare : (implicit : (K, K) -> Order.Order)) : Map.Map<K, V> {
    let ops = OrderedMap.Make(compare);
    let new = Map.empty<K, V>();
    for ((k, v) in ops.entries(old)) {
      new.add(k, v);
    };
    new;
  };

  public func migrateOrderedSet<T>(old : OrderedSet.Set<T>, compare : (implicit : (T, T) -> Order.Order)) : Set.Set<T> {
    let ops = OrderedSet.Make(compare);
    let new = Set.empty<T>();
    for (k in ops.vals(old)) {
      new.add(k);
    };
    new;
  };

  public func migrateList<T>(old : ListBase.List<T>) : List.List<T> {
    let list = List.empty<T>();
    for (item in ListBase.toIter(old)) {
      list.add(item);
    };
    list;
  };

  // Auth multi-user state types for migration
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

  public type OldMultiUserState = {
    var adminAssigned : Bool;
    var userRoles : OrderedMap.Map<Principal, UserRole>;
    var approvalStatus : OrderedMap.Map<Principal, ApprovalStatus>;
  };

  public type NewMultiUserState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
    approvalStatus : Map.Map<Principal, ApprovalStatus>;
  };

  public func migrateMultiUserState(old : OldMultiUserState) : NewMultiUserState {
    {
      var adminAssigned = old.adminAssigned;
      userRoles = migrateOrderedMap<Principal, UserRole>(old.userRoles);
      approvalStatus = migrateOrderedMap<Principal, ApprovalStatus>(old.approvalStatus);
    };
  };
};
