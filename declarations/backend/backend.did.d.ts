import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type ApprovalStatus = { 'pending' : null } |
  { 'approved' : null } |
  { 'rejected' : null };
export interface CustomReport {
  'selectedLocations' : Array<Location>,
  'combinedTotals' : Array<[string, bigint]>,
}
export interface Item {
  'id' : bigint,
  'name' : string,
  'unit' : string,
  'description' : string,
}
export interface Location {
  'id' : bigint,
  'filterRequirements' : Array<[string, bigint]>,
  'active' : boolean,
  'name' : string,
  'completed' : boolean,
  'beltRequirements' : Array<[string, bigint]>,
}
export interface OrderItem {
  'itemId' : bigint,
  'name' : string,
  'quantity' : bigint,
}
export interface StagingReport {
  'locationId' : bigint,
  'items' : Array<[string, bigint]>,
  'locationName' : string,
}
export interface StockLevel { 'itemId' : bigint, 'quantity' : bigint }
export interface UserApprovalInfo {
  'status' : ApprovalStatus,
  'principal' : Principal,
}
export interface UserProfile { 'name' : string }
export type UserRole = { 'admin' : null } |
  { 'user' : null } |
  { 'guest' : null };
export interface _SERVICE {
  'assignCallerUserRole' : ActorMethod<[Principal, UserRole], undefined>,
  'createItem' : ActorMethod<[string, string, string], undefined>,
  'createLocation' : ActorMethod<
    [string, Array<[string, bigint]>, Array<[string, bigint]>],
    undefined
  >,
  'deleteItem' : ActorMethod<[bigint], undefined>,
  'deleteLocation' : ActorMethod<[bigint], undefined>,
  'generateCustomReport' : ActorMethod<[Array<bigint>], CustomReport>,
  'generateOrder' : ActorMethod<[], Array<OrderItem>>,
  'generateStagingReport' : ActorMethod<[], Array<StagingReport>>,
  'getAllItems' : ActorMethod<[], Array<Item>>,
  'getAllLocations' : ActorMethod<[], Array<Location>>,
  'getAllStockLevels' : ActorMethod<[], Array<StockLevel>>,
  'getCallerUserProfile' : ActorMethod<[], [] | [UserProfile]>,
  'getCallerUserRole' : ActorMethod<[], UserRole>,
  'getStockLevelByItemId' : ActorMethod<[bigint], [] | [StockLevel]>,
  'getUserProfile' : ActorMethod<[Principal], [] | [UserProfile]>,
  'initializeAccessControl' : ActorMethod<[], undefined>,
  'isCallerAdmin' : ActorMethod<[], boolean>,
  'isCallerApproved' : ActorMethod<[], boolean>,
  'listApprovals' : ActorMethod<[], Array<UserApprovalInfo>>,
  'requestApproval' : ActorMethod<[], undefined>,
  'saveCallerUserProfile' : ActorMethod<[UserProfile], undefined>,
  'setApproval' : ActorMethod<[Principal, ApprovalStatus], undefined>,
  'updateItem' : ActorMethod<[bigint, string, string, string], undefined>,
  'updateLocation' : ActorMethod<
    [bigint, string, Array<[string, bigint]>, Array<[string, bigint]>],
    undefined
  >,
  'updateLocationActiveStatus' : ActorMethod<[bigint, boolean], undefined>,
  'updateLocationCompletionStatus' : ActorMethod<[bigint, boolean], undefined>,
  'updateStockLevel' : ActorMethod<[bigint, bigint], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
