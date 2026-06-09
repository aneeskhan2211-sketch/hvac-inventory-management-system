export const idlFactory = ({ IDL }) => {
  const UserRole = IDL.Variant({
    'admin' : IDL.Null,
    'user' : IDL.Null,
    'guest' : IDL.Null,
  });
  const Location = IDL.Record({
    'id' : IDL.Nat,
    'filterRequirements' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat)),
    'active' : IDL.Bool,
    'name' : IDL.Text,
    'completed' : IDL.Bool,
    'beltRequirements' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat)),
  });
  const CustomReport = IDL.Record({
    'selectedLocations' : IDL.Vec(Location),
    'combinedTotals' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat)),
  });
  const OrderItem = IDL.Record({
    'itemId' : IDL.Nat,
    'name' : IDL.Text,
    'quantity' : IDL.Nat,
  });
  const StagingReport = IDL.Record({
    'locationId' : IDL.Nat,
    'items' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat)),
    'locationName' : IDL.Text,
  });
  const Item = IDL.Record({
    'id' : IDL.Nat,
    'name' : IDL.Text,
    'unit' : IDL.Text,
    'description' : IDL.Text,
  });
  const StockLevel = IDL.Record({ 'itemId' : IDL.Nat, 'quantity' : IDL.Nat });
  const UserProfile = IDL.Record({ 'name' : IDL.Text });
  const ApprovalStatus = IDL.Variant({
    'pending' : IDL.Null,
    'approved' : IDL.Null,
    'rejected' : IDL.Null,
  });
  const UserApprovalInfo = IDL.Record({
    'status' : ApprovalStatus,
    'principal' : IDL.Principal,
  });
  return IDL.Service({
    'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
    'createItem' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
    'createLocation' : IDL.Func(
        [
          IDL.Text,
          IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat)),
          IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat)),
        ],
        [],
        [],
      ),
    'deleteItem' : IDL.Func([IDL.Nat], [], []),
    'deleteLocation' : IDL.Func([IDL.Nat], [], []),
    'generateCustomReport' : IDL.Func([IDL.Vec(IDL.Nat)], [CustomReport], []),
    'generateOrder' : IDL.Func([], [IDL.Vec(OrderItem)], []),
    'generateStagingReport' : IDL.Func([], [IDL.Vec(StagingReport)], []),
    'getAllItems' : IDL.Func([], [IDL.Vec(Item)], ['query']),
    'getAllLocations' : IDL.Func([], [IDL.Vec(Location)], ['query']),
    'getAllStockLevels' : IDL.Func([], [IDL.Vec(StockLevel)], ['query']),
    'getCallerUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
    'getStockLevelByItemId' : IDL.Func(
        [IDL.Nat],
        [IDL.Opt(StockLevel)],
        ['query'],
      ),
    'getUserProfile' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(UserProfile)],
        ['query'],
      ),
    'initializeAccessControl' : IDL.Func([], [], []),
    'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'isCallerApproved' : IDL.Func([], [IDL.Bool], ['query']),
    'listApprovals' : IDL.Func([], [IDL.Vec(UserApprovalInfo)], ['query']),
    'requestApproval' : IDL.Func([], [], []),
    'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
    'setApproval' : IDL.Func([IDL.Principal, ApprovalStatus], [], []),
    'updateItem' : IDL.Func([IDL.Nat, IDL.Text, IDL.Text, IDL.Text], [], []),
    'updateLocation' : IDL.Func(
        [
          IDL.Nat,
          IDL.Text,
          IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat)),
          IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat)),
        ],
        [],
        [],
      ),
    'updateLocationActiveStatus' : IDL.Func([IDL.Nat, IDL.Bool], [], []),
    'updateLocationCompletionStatus' : IDL.Func([IDL.Nat, IDL.Bool], [], []),
    'updateStockLevel' : IDL.Func([IDL.Nat, IDL.Nat], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
