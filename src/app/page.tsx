"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { SessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";
import { accountsDatabase, categories } from "@/data/accounts";

function HomeContent() {
  const { data: session } = useSession();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedAccounts, setCheckedAccounts] = useState({});
  const [showOnlyChecked, setShowOnlyChecked] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("checkedAccounts");
    if (saved) {
      setCheckedAccounts(JSON.parse(saved));
    }
  }, []);

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

  const toggleAccount = (accountName) => {
    setCheckedAccounts((prev) => ({
      ...prev,
      [accountName]: !prev[accountName],
    }));
  };

  const selectAll = () => {
    const newChecked = { ...checkedAccounts };
    filteredAccounts.forEach((account) => {
      newChecked[account.name] = true;
    });
    setCheckedAccounts(newChecked);
  };

  const deselectAll = () => {
    const newChecked = { ...checkedAccounts };
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
    alert(message);
  };

  const exportToCSV = () => {
    const selected = Object.keys(checkedAccounts).filter(
      (name) => checkedAccounts[name]
    );
    if (selected.length === 0) {
      alert("No accounts selected");
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-5xl font-bold mb-6">
            Find & Delete Your Digital Footprint
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Discover services connected to your email
          </p>
          <button
            onClick={() => signIn("google")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition"
          >
            🚀 Get Started Free
          </button>
        </div>
      </div>
    );
  }

  const checkedCount = Object.keys(checkedAccounts).filter(
    (name) => checkedAccounts[name]
  ).length;

  return (
    <div
      className={`min-h-screen transition-all ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧹</span>
            <div>
              <h1 className="text-2xl font-bold">Account Cleaner</h1>
              <p className="text-sm text-gray-500">{session.user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                isDarkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              {isDarkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
            {checkedCount > 0 && (
              <button
                onClick={deleteCheckedAccounts}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition"
              >
                🗑️ Delete ({checkedCount})
              </button>
            )}
            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm transition"
            >
              📥 Export CSV
            </button>
            <button
              onClick={() => signOut()}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div
            className={`p-4 rounded-xl ${
              isDarkMode ? "bg-gray-800" : "bg-white shadow"
            }`}
          >
            <p className="text-2xl font-bold">{accountsDatabase.length}</p>
            <p className="text-sm text-gray-500">Total Services</p>
          </div>
          <div
            className={`p-4 rounded-xl ${
              isDarkMode ? "bg-gray-800" : "bg-white shadow"
            }`}
          >
            <p className="text-2xl font-bold text-red-500">{checkedCount}</p>
            <p className="text-sm text-gray-500">Selected to Delete</p>
          </div>
          <div
            className={`p-4 rounded-xl ${
              isDarkMode ? "bg-gray-800" : "bg-white shadow"
            }`}
          >
            <p className="text-2xl font-bold">{categories.length - 1}</p>
            <p className="text-sm text-gray-500">Categories</p>
          </div>
          <div
            className={`p-4 rounded-xl ${
              isDarkMode ? "bg-gray-800" : "bg-white shadow"
            }`}
          >
            <p className="text-2xl font-bold">
              {Math.round((checkedCount / accountsDatabase.length) * 100)}%
            </p>
            <p className="text-sm text-gray-500">Completion</p>
          </div>
        </div>

        <input
          type="text"
          placeholder="🔍 Search for a service..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full p-4 rounded-xl mb-6 ${
            isDarkMode ? "bg-gray-800" : "bg-white border"
          } focus:outline-none focus:ring-2 focus:ring-purple-500`}
        />

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm transition ${
                selectedCategory === cat
                  ? "bg-purple-600 text-white"
                  : isDarkMode
                  ? "bg-gray-800"
                  : "bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={selectAll}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
          >
            ✅ Select All
          </button>
          <button
            onClick={deselectAll}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm"
          >
            ❌ Deselect All
          </button>
          <button
            onClick={() => setShowOnlyChecked(!showOnlyChecked)}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              showOnlyChecked
                ? "bg-green-600"
                : isDarkMode
                ? "bg-gray-700"
                : "bg-gray-300"
            }`}
          >
            {showOnlyChecked ? "👁️ Showing Selected" : "👁️ Show Selected"}
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-3">
          Showing {displayedAccounts.length} of {filteredAccounts.length}{" "}
          services
        </p>

        <div className="space-y-2">
          {displayedAccounts.map((account) => (
            <div
              key={account.name}
              className={`p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                isDarkMode ? "bg-gray-800" : "bg-white shadow"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={checkedAccounts[account.name] || false}
                  onChange={() => toggleAccount(account.name)}
                  className="w-5 h-5"
                />
                <div>
                  <h3 className="font-semibold">{account.name}</h3>
                  <span className="text-xs text-gray-500">
                    {account.category}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={account.deleteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 hover:text-red-400 text-sm"
                >
                  🗑️ Delete →
                </a>
              </div>
            </div>
          ))}
        </div>

        {displayedAccounts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            🔍 No accounts found.
          </div>
        )}

        <footer className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>© 2024 Account Cleaner. Take control of your digital footprint.</p>
        </footer>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <SessionProvider>
      <HomeContent />
    </SessionProvider>
  );
}
