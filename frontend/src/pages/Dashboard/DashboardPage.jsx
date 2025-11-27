import React from "react";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="text-sm text-slate-500">Dashboard placeholder</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* placeholder cards */}
        <div className="bg-white rounded-lg shadow p-4">User card placeholder</div>
        <div className="bg-white rounded-lg shadow p-4">User card placeholder</div>
        <div className="bg-white rounded-lg shadow p-4">User card placeholder</div>
      </div>
    </div>
  );
}
