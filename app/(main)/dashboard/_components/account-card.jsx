"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import Link from "next/link";
import { updateDefaultAccount, deleteAccount, updateAccount } from "@/actions/account";

export function AccountCard({ account }) {
  const { name, type, balance, id, isDefault } = account;

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error: defaultError,
  } = useFetch(updateDefaultAccount);

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deletedData,
    error: deleteError,
  } = useFetch(deleteAccount);

  const {
    loading: updateLoading,
    fn: updateFn,
    data: updatedData,
    error: updateError,
  } = useFetch(updateAccount);

  const handleDefaultChange = async (event) => {
    event.preventDefault();

    if (isDefault) {
      toast.warning("You need at least 1 default account");
      return;
    }

    await updateDefaultFn(id);
  };

  const handleUpdate = async () => {
    const newName = prompt("Enter new account name:", name);
    if (!newName) return;
  
    const newType = prompt("Enter new account type (CHECKING or SAVINGS):", type);
    if (!newType || !["CHECKING", "SAVINGS"].includes(newType.toUpperCase())) {
      toast.error("Invalid account type");
      return;
    }
  
    const newBalanceStr = prompt("Enter new account balance:", balance);
    const newBalance = parseFloat(newBalanceStr);
    if (isNaN(newBalance)) {
      toast.error("Invalid balance value");
      return;
    }
  
    const result = await updateFn(id, {
      name: newName,
      type: newType.toUpperCase(),
      balance: newBalance,
    });
  
    if (result?.success) toast.success("Account updated successfully");
  };
  

  const handleDelete = async () => {
    const confirmed = confirm("Are you sure you want to delete this account?");
    if (!confirmed) return;

    const result = await deleteFn(id);
    if (result?.success) toast.success("Account deleted successfully");
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
    }
    if (defaultError) {
      toast.error(defaultError.message || "Failed to update default account");
    }
  }, [updatedAccount, defaultError]);

  useEffect(() => {
    if (deleteError) toast.error(deleteError.message || "Delete failed");
    if (updateError) toast.error(updateError.message || "Update failed");
  }, [deleteError, updateError]);

  return (
    <Card className="hover:shadow-md transition-shadow group relative">
      <Link href={`/account/${id}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium capitalize">{name}</CardTitle>
          <Switch
            checked={isDefault}
            onClick={handleDefaultChange}
            disabled={updateDefaultLoading}
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${parseFloat(balance).toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()} Account
          </p>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
            Income
          </div>
          <div className="flex items-center">
            <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
            Expense
          </div>
        </CardFooter>
      </Link>

      <div className="mt-4 flex justify-between px-4 pb-4">
        <button
          onClick={handleUpdate}
          disabled={updateLoading}
          className="flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {updateLoading ? "Updating..." : "Update"}
        </button>

        <button
          onClick={handleDelete}
          disabled={deleteLoading}
          className="flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {deleteLoading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </Card>
  );
}
