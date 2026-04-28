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
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showDeleteGuide, setShowDeleteGuide] = useState<string | null>(null);

  // Load saved selections from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("checkedAccounts");
    if (saved) {
      setCheckedAccounts(JSON.parse(saved));
    }
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    }
  }, []);

  // Save selections to localStorage
  useEffect(() => {
    localStorage.setItem("checkedAccounts", JSON.stringify(checkedAccounts));
  }, [checkedAccounts]);

  // Save theme
  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

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
        message += `${account.logo || "📧"} ${name}: ${account.deleteUrl}\n\n`;
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

  const getDeleteGuide = (accountName: string) => {
    const guides: Record<string, string> = {
      Netflix:
        "1. Go to Account Settings\n2. Click 'Cancel Subscription'\n3. Click 'Finish Cancellation'\n4. Confirm deletion",
      Spotify:
        "1. Go to Account Overview\n2. Click 'Close Account'\n3. Enter your password\n4. Click 'Close Account'",
      Facebook:
        "1. Go to Settings & Privacy\n2. Click 'Your Facebook Information'\n3. Click 'Deactivation and Deletion'\n4. Select 'Delete Account'",
      Instagram:
        "1. Go to Delete Your Account page\n2. Select reason from dropdown\n3. Enter your password\n4. Click 'Permanently delete my account'",
      Twitter:
        "1. Go to Settings\n2. Click 'Deactivate your account'\n3. Read information\n4. Click 'Deactivate'",
    };
    return (
      guides[accountName] ||
      "1. Click the delete link above\n2. Follow the website's instructions\n3. Confirm account deletion"
    );
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Find & Delete Your Digital Footprint
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Discover over 300+ services connected to your email
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
      className={`min-h-screen transition-all duration-300 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
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
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div
            className={`p-4 rounded-xl ${
              isDarkMode ? "bg-gray-800" : "bg-white shadow"
            }`}
          >
            <div className="text-2xl mb-1">📋</div>
            <p className="text-2xl font-bold">{accountsDatabase.length}</p>
            <p className="text-sm text-gray-500">Total Services</p>
          </div>
          <div
            className={`p-4 rounded-xl ${
              isDarkMode ? "bg-gray-800" : "bg-white shadow"
            }`}
          >
            <div className="text-2xl mb-1">✅</div>
            <p className="text-2xl font-bold text-red-500">{checkedCount}</p>
            <p className="text-sm text-gray-500">Selected to Delete</p>
          </div>
          <div
            className={`p-4 rounded-xl ${
              isDarkMode ? "bg-gray-800" : "bg-white shadow"
            }`}
          >
            <div className="text-2xl mb-1">📊</div>
            <p className="text-2xl font-bold">{categories.length - 1}</p>
            <p className="text-sm text-gray-500">Categories</p>
          </div>
          <div
            className={`p-4 rounded-xl ${
              isDarkMode ? "bg-gray-800" : "bg-white shadow"
            }`}
          >
            <div className="text-2xl mb-1">🎯</div>
            <p className="text-2xl font-bold">
              {Math.round((checkedCount / accountsDatabase.length) * 100)}%
            </p>
            <p className="text-sm text-gray-500">Completion</p>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Search for a service..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full p-4 rounded-xl mb-6 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-300 border"
          } focus:outline-none focus:ring-2 focus:ring-purple-500`}
        />

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm transition ${
                selectedCategory === cat
                  ? "bg-purple-600 text-white"
                  : isDarkMode
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-gray-200 hover:bg-gray-300"
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

        {/* Delete Guide Modal */}
        {showDeleteGuide && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteGuide(null)}
          >
            <div
              className={`max-w-md w-full rounded-2xl p-6 ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">
                Delete Guide: {showDeleteGuide}
              </h3>
              <div
                className={`p-4 rounded-lg mb-4 ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <p className="whitespace-pre-line">
                  {getDeleteGuide(showDeleteGuide)}
                </p>
              </div>
              <div className="bg-yellow-900/30 rounded-lg p-3 mb-4">
                <p className="text-yellow-600 text-sm">
                  ⚠️ Warning: This action is permanent and cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteGuide(null)}
                className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg"
              >
                Got it
              </button>
            </div>
          </div>
        )}

        {/* Accounts List */}
        <div className="space-y-2">
          {displayedAccounts.map((account) => (
            <div
              key={account.name}
              className={`p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition hover:shadow-lg ${
                isDarkMode
                  ? "bg-gray-800 hover:bg-gray-750"
                  : "bg-white shadow hover:shadow-xl"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={checkedAccounts[account.name] || false}
                  onChange={() => toggleAccount(account.name)}
                  className="w-5 h-5 cursor-pointer"
                />
                <span className="text-2xl">{account.logo || "📧"}</span>
                <div>
                  <h3 className="font-semibold">{account.name}</h3>
                  <span className="text-xs text-gray-500">
                    {account.category}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteGuide(account.name)}
                  className="text-blue-500 hover:text-blue-400 text-sm"
                >
                  📖 Guide
                </button>
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
            🔍 No accounts found. Try a different search.
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>
            © 2024 Account Cleaner. Take control of your digital footprint. 🔐
          </p>
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
