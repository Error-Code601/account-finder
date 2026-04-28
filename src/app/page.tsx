"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { SessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";
import { accountsDatabase, categories } from "@/data/accounts";

function HomeContent() {
  const { data: session } = useSession();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedAccounts, setCheckedAccounts] = useState<
    Record<string, boolean>
  >({});
  const [showOnlyChecked, setShowOnlyChecked] = useState(false);

  // Load saved selections from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("checkedAccounts");
    if (saved) {
      setCheckedAccounts(JSON.parse(saved));
    }
  }, []);

  // Save selections to localStorage
  useEffect(() => {
    localStorage.setItem("checkedAccounts", JSON.stringify(checkedAccounts));
  }, [checkedAccounts]);

  const filteredAccounts = accountsDatabase.filter((account) => {
    if (selectedCategory !== "All" && account.category !== selectedCategory)
      return false;
    if (
      searchQuery &&
      !account.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const displayedAccounts = showOnlyChecked
    ? filteredAccounts.filter((acc) => checkedAccounts[acc.name])
    : filteredAccounts;

  const toggleAccount = (accountName: string) => {
    setCheckedAccounts((prev) => ({
      ...prev,
      [accountName]: !prev[accountName],
    }));
  };

  const selectAll = () => {
    const newChecked: Record<string, boolean> = { ...checkedAccounts };
    filteredAccounts.forEach((account) => {
      newChecked[account.name] = true;
    });
    setCheckedAccounts(newChecked);
  };

  const deselectAll = () => {
    const newChecked: Record<string, boolean> = { ...checkedAccounts };
    filteredAccounts.forEach((account) => {
      delete newChecked[account.name];
    });
    setCheckedAccounts(newChecked);
  };

  const deleteCheckedAccounts = () => {
    const checkedNames = Object.keys(checkedAccounts).filter(
      (name) => checkedAccounts[name]
    );
    if (checkedNames.length === 0) {
      alert("No accounts selected");
      return;
    }

    let message = "Open these links to delete your accounts:\n\n";
    checkedNames.forEach((name) => {
      const account = accountsDatabase.find((a) => a.name === name);
      if (account) {
        message += `${name}: ${account.deleteUrl}\n\n`;
      }
    });
    message +=
      "\nPro tip: Open each link in a new tab and follow the deletion steps.";

    alert(message);
  };

  const exportToCSV = () => {
    const selected = Object.keys(checkedAccounts).filter(
      (name) => checkedAccounts[name]
    );
    if (selected.length === 0) {
      alert("No accounts selected to export");
      return;
    }
    const csv = selected.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "accounts-to-delete.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!session) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-xl px-6">
          <h1 className="text-5xl font-bold mb-6">
            Find & Delete Accounts Linked To Your Email
          </h1>
          <p className="text-gray-400 mb-8 text-lg">
            Discover 200+ services and easily delete accounts you no longer use.
          </p>
          <button
            onClick={() => signIn("google")}
            className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:scale-105 transition"
          >
            Get Started Free
          </button>
        </div>
      </main>
    );
  }

  const checkedCount = Object.keys(checkedAccounts).filter(
    (name) => checkedAccounts[name]
  ).length;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Account Cleanup</h1>
            <p className="text-gray-400 text-sm mt-1">{session.user?.email}</p>
          </div>
          <div className="flex gap-3">
            {checkedCount > 0 && (
              <button
                onClick={deleteCheckedAccounts}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition"
              >
                Delete Selected ({checkedCount})
              </button>
            )}

            {/* Export CSV Button */}
            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm transition"
            >
              Export CSV ({checkedCount})
            </button>

            <button
              onClick={() => signOut()}
              className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gray-900 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-6">
            <div>
              <span className="text-gray-400 text-sm">Total Services</span>
              <p className="text-2xl font-bold">{accountsDatabase.length}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Selected to Delete</span>
              <p className="text-2xl font-bold text-red-400">{checkedCount}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Categories</span>
              <p className="text-2xl font-bold">{categories.length - 1}</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search for a service... (e.g., Netflix, Amazon, Uber)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm transition ${
                selectedCategory === cat
                  ? "bg-white text-black"
                  : "bg-gray-900 text-gray-400 hover:bg-gray-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={selectAll}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition"
          >
            Select All Filtered
          </button>
          <button
            onClick={deselectAll}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition"
          >
            Deselect All Filtered
          </button>
          <button
            onClick={() => setShowOnlyChecked(!showOnlyChecked)}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              showOnlyChecked
                ? "bg-green-600 text-white"
                : "bg-gray-900 text-gray-400 hover:bg-gray-800"
            }`}
          >
            {showOnlyChecked ? "Showing: Selected Only" : "Show Only Selected"}
          </button>
        </div>

        {/* Results count */}
        <p className="text-gray-500 text-sm mb-3">
          Showing {displayedAccounts.length} of {filteredAccounts.length}{" "}
          services
        </p>

        {/* Accounts List */}
        <div className="grid gap-2">
          {displayedAccounts.map((account) => (
            <div
              key={account.name}
              className="bg-gray-900 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-gray-800 transition"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={checkedAccounts[account.name] || false}
                  onChange={() => toggleAccount(account.name)}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-800 accent-white"
                />
                <div>
                  <h3 className="font-semibold">{account.name}</h3>
                  <span className="text-gray-500 text-xs">
                    {account.category}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 ml-8 sm:ml-0">
                <a
                  href={account.deleteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 text-sm transition"
                >
                  Delete Account →
                </a>
              </div>
            </div>
          ))}
        </div>

        {displayedAccounts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No accounts found. Try a different search or category.
          </div>
        )}
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <SessionProvider>
      <HomeContent />
    </SessionProvider>
  );
}
