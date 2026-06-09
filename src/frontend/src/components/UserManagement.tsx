import { AlertCircle, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type UserInfo,
  useDeleteUser,
  useListUsers,
} from "../hooks/useQueries";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";

export default function UserManagement() {
  const { data: users = [], isLoading, error } = useListUsers();
  const deleteUserMutation = useDeleteUser();
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUserMutation.mutateAsync(userToDelete);
      toast.success("User deleted successfully");
      setUserToDelete(null);
    } catch (error: any) {
      console.error("Failed to delete user:", error);
      toast.error(error.message || "Failed to delete user");
    }
  };

  if (isLoading) {
    return (
      <div className="mobile-spacing">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mobile-spacing">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">
              Failed to load users. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-spacing">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            User Management
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage registered users (all authenticated users have full admin
            access)
          </p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No users found
          </h3>
          <p className="text-gray-600">
            Users will appear here once they authenticate with the application.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Principal ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user: UserInfo) => (
                  <tr key={user.principal} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">
                      {user.principal.slice(0, 20)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {user.profile.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setUserToDelete(user.principal)}
                        disabled={deleteUserMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden space-y-4">
            {users.map((user: UserInfo) => (
              <div key={user.principal} className="mobile-card">
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase block">
                      Name
                    </span>
                    <p className="text-sm text-gray-900">{user.profile.name}</p>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase block">
                      Principal ID
                    </span>
                    <p className="text-sm font-mono text-gray-900 break-all">
                      {user.principal}
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => setUserToDelete(user.principal)}
                      disabled={deleteUserMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete User
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AlertDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone. The user will lose all access to the application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUserMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
