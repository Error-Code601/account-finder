"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { SessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";
import { accountsDatabase, categories } from "@/data/accounts";

function HomeContent() {
  const { data: session } = useSession();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedAccounts, setCheckedAccounts] = useState<Record<string, boolean>>({});
  const [showOnlyChecked, setShowOnlyChecked] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
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
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const filteredAccounts = accountsDatabase.filter(account => {
    if (selectedCategory !== "All" && account.category !== selectedCategory) return false;
    if (searchQuery && !account.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const displayedAccounts = showOnlyChecked 
    ? filteredAccounts.filter(acc => checkedAccounts[acc.name])
    : filteredAccounts;

  const toggleAccount = (accountName: string) => {
    setCheckedAccounts(prev => ({
      ...prev,
      [accountName]: !prev[accountName]
    }));
  };

  const selectAll = () => {
    const newChecked: Record<string, boolean> = { ...checkedAccounts };
    filteredAccounts.forEach(account => {
      newChecked[account.name] = true;
    });
    setCheckedAccounts(newChecked);
  };

  const deselectAll = () => {
    const newChecked: Record<string, boolean> = { ...checkedAccounts };
    filteredAccounts.forEach(account => {
      delete newChecked[account.name];
    });
    setCheckedAccounts(newChecked);
  };

  const deleteCheckedAccounts = () => {
    const checkedNames = Object.keys(checkedAccounts).filter(name => checkedAccounts[name]);
    if (checkedNames.length === 0) {
      alert("No accounts selected");
      return;
    }
    
    let message = "Open these links to delete your accounts:\n\n";
    checkedNames.forEach(name => {
      const account = accountsDatabase.find(a => a.name === name);
      if (account) {
        message += `${account.logo || "📧"} ${name}: ${account.deleteUrl}\n\n`;
      }
    });
    message += "\nPro tip: Open each link in a new tab and follow the deletion steps.";
    
    alert(message);
  };

  const exportToCSV = () => {
    const selected = Object.keys(checkedAccounts).filter(name => checkedAccounts[name]);
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
      "Netflix": "1. Go to Account Settings\n2. Click 'Cancel Subscription'\n3. Click 'Finish Cancellation'\n4. Confirm deletion",
      "Spotify": "1. Go to Account Overview\n2. Click 'Close Account'\n3. Enter your password\n4. Click 'Close Account'",
      "Facebook": "1. Go to Settings & Privacy\n2. Click 'Your Facebook Information'\n3. Click 'Deactivation and Deletion'\n4. Select 'Delete Account'\n5. Click 'Continue to Account Deletion'",
      "Instagram": "1. Go to Delete Your Account page\n2. Select reason from dropdown\n3. Enter your password\n4. Click 'Permanently delete my account'",
      "Twitter": "1. Go to Settings\n2. Click 'Deactivate your account'\n3. Read information\n4. Click 'Deactivate'\n5. Enter password to confirm",
    };
    return guides[accountName] || "1. Click the delete link above\n2. Follow the website's instructions\n3. Confirm account deletion";
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full opacity-20 blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        {/* Navigation */}
        <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🧹</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">Account Cleaner</span>
          </div>
          <div className="flex gap-4">
            <button className="text-gray-300 hover:text-white transition">About</button>
            <button className="text-gray-300 hover:text-white transition">Privacy</button>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="relative z-10 container mx-auto px-6 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-bounce mb-6 text-7xl">🔐</div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-300 to-pink-300 bg-clip-text text-transparent animate-fade-in">
              Find & Delete Your Digital Footprint
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto animate-slide-up">
              Discover over 300+ services connected to your email and delete accounts you no longer use.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-delay">
              <button
                onClick={() => signIn("google")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                🚀 Get Started Free
              </button>
              <button className="border border-gray-600 hover:border-purple-500 text-gray-300 px-8 py-4 rounded-full text-lg font-semibold transition-all">
                📖 Learn More
              </button>
            </div>
            <div className="mt-12 flex flex-wrap gap-6 justify-center text-gray-400 text-sm">
              <span className="flex items-center gap-2">✅ 300+ Services</span>
              <span className="flex items-center gap-2">🔒 Privacy First</span>
              <span className="flex items-center gap-2">🚀 One-Click Delete Links</span>
              <span className="flex items-center gap-2">📊 Export Your Data</span>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 container mx-auto px-6 py-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>© 2024 Account Cleaner. Take control of your digital footprint.</p>
          <div className="flex gap-4 justify-center mt-4">
            <span>Twitter</span>
            <span>GitHub</span>
            <span>Privacy Policy</span>
            <span>Terms</span>
          </div>
        </footer>
      </div>
    );
  }

  const checkedCount = Object.keys(checkedAccounts).filter(name => checkedAccounts[name]).length;

  return (
    <div className={`min-h-screen transition-all duration-300 ${isDarkMode ? "dark bg-gray-900" : "bg-gray-100"}`}>
      <div className="dark:bg-gray-900 bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Header with theme toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl sm:text-4xl animate-bounce">🧹</div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold dark:text-white text-gray-900">Account Cleaner</h1>
                <p className="text-sm dark:text-gray-400 text-gray-600">{session.user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 px-3 py-2 rounded-lg text-sm transition"
              >
                {isDarkMode ? "☀️ Light" : "🌙 Dark"}
              </button>
              
              {checkedCount > 0 && (
                <button
                  onClick={deleteCheckedAccounts}
                  className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-sm transition"
                >
                  🗑️ Delete ({checkedCount})
                </button>
              )}
              
              <button
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg text-sm transition"
              >
                📥 Export CSV
              </button>
              
              <button
                onClick={() => signOut()}
                className="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm transition"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="dark:bg-gray-800 bg-white rounded-xl p-3 sm:p-4 shadow-lg transform hover:scale-105 transition">
              <div className="text-2xl sm:text-3xl mb-1">📋</div>
              <p className="text-2xl sm:text-3xl font-bold dark:text-white text-gray-900">{accountsDatabase.length}</p>
              <p className="text-xs sm:text-sm dark:text-gray-400 text-gray-600">Total Services</p>
            </div>
            <div className="dark:bg-gray-800 bg-white rounded-xl p-3 sm:p-4 shadow-lg transform hover:scale-105 transition">
              <div className="text-2xl sm:text-3xl mb-1">✅</div>
              <p className="text-2xl sm:text-3xl font-bold text-red-500">{checkedCount}</p>
              <p className="text-xs sm:text-sm dark:text-gray-400 text-gray-600">Selected to Delete</p>
            </div>
            <div className="dark:bg-gray-800 bg-white rounded-xl p-3 sm:p-4 shadow-lg transform hover:scale-105 transition">
              <div className="text-2xl sm:text-3xl mb-1">📊</div>
              <p className="text-2xl sm:text-3xl font-bold dark:text-white text-gray-900">{categories.length - 1}</p>
              <p className="text-xs sm:text-sm dark:text-gray-400 text-gray-600">Categories</p>
            </div>
            <div className="dark:bg-gray-800 bg-white rounded-xl p-3 sm:p-4 shadow-lg transform hover:scale-105 transition">
              <div className="text-2xl sm:text-3xl mb-1">🎯</div>
              <p className="text-2xl sm:text-3xl font-bold dark:text-white text-gray-900">
                {Math.round((checkedCount / accountsDatabase.length) * 100)}%
              </p>
              <p className="text-xs sm:text-sm dark:text-gray-400 text-gray-600">Completion</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4 sm:mb-6">
            <input
              type="text"
              placeholder="🔍 Search for a service... (e.g., Netflix, Amazon, Uber)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full dark:bg-gray-800 bg-white border dark:border-gray-700 border-gray-300 rounded-xl px-4 py-3 sm:py-4 dark:text-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm transition transform hover:scale-105 ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "dark:bg-gray-800 bg-gray-200 dark:text-gray-300 text-gray-700 hover:dark:bg-gray-700 hover:bg-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
            <button
              onClick={selectAll}
              className="bg-blue-600 hover:bg-blue-700 px-3 sm:px-4 py-2 rounded-lg text-sm transition"
            >
              ✅ Select All
            </button>
            <button
              onClick={deselectAll}
              className="dark:bg-gray-700 bg-gray-400 hover:dark:bg-gray-600 hover:bg-gray-500 px-3 sm:px-4 py-2 rounded-lg text-sm transition dark:text-white text-white"
            >
              ❌ Deselect All
            </button>
            <button
              onClick={() => setShowOnlyChecked(!showOnlyChecked)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition ${
                showOnlyChecked
                  ? "bg-green-600 text-white"
                  : "dark:bg-gray-700 bg-gray-400 dark:text-gray-300 text-white hover:dark:bg-gray-600"
              }`}
            >
              {showOnlyChecked ? "👁️ Showing Selected" : "👁️ Show Selected"}
            </button>
          </div>

          {/* Results count */}
          <p className="dark:text-gray-400 text-gray-600 text-sm mb-3">
            Showing {displayedAccounts.length} of {filteredAccounts.length} services
          </p>

          {/* Delete Guide Modal */}
          {showDeleteGuide && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteGuide(null)}>
              <div className="dark:bg-gray-800 bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold dark:text-white text-gray-900">Delete Guide</h3>
                  <button onClick={() => setShowDeleteGuide(null)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <div className="space-y-4">
                  <div className="dark:bg-gray-700 bg-gray-100 rounded-lg p-4">
                    <p className="dark:text-gray-300 text-gray-600 whitespace-pre-line">{getDeleteGuide(showDeleteGuide)}</p>
                  </div>
                  <div className="dark:bg-yellow-900/30 bg-yellow-50 rounded-lg p-3">
                    <p className="text-yellow-600 dark:text-yellow-400 text-sm">⚠️ Warning: This action is permanent and cannot be undone.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteGuide(null)}
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition"
                >
                  Got it
                </button>
              </div>
            </div>
          )}

          {/* Accounts List */}
          <div className="grid gap-2 sm:gap-3">
            {displayedAccounts.map((account, index) => (
              <div
                key={account.name}
                className="dark:bg-gray-800 bg-white rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] animate-fade-in"
                style={{ animationDelay: `${index * 10}ms` }}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={checkedAccounts[account.name] || false}
                    onChange={() => toggleAccount(account.name)}
                    className="w-5 h-5 rounded border-gray-300 cursor-pointer accent-purple-600"
                  />
                  <span className="text-xl sm:text-2xl">{account.logo || "📧"}</span>
                  <div>
                    <h3 className="font-semibold dark:text-white text-gray-900">{account.name}</h3>
                    <span className="dark:text-gray-500 text-gray-400 text-xs">{account.category}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-8 sm:ml-0">
                  <button
                    onClick={() => setShowDeleteGuide(account.name)}
                    className="text-blue-400 hover:text-blue-300 text-sm transition"
                  >
                    📖 Guide
                  </button>
                  <a
                    href={account.deleteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300 text-sm transition"
                  >
                    🗑️ Delete →
                  </a>
                </div>
              </div>
            ))}
          </div>

          {displayedAccounts.length === 0 && (
            <div className="text-center py-12 dark:text-gray-400 text-gray-600">
              🔍 No accounts found. Try a different search or category.
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t dark:border-gray-800 border-gray-200 py-6 sm:py-8 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-4 text-sm dark:text-gray-400 text-gray-600">
              <span>About</span>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Contact</span>
              <span>GitHub</span>
            </div>
            <p className="dark:text-gray-500 text-gray-400 text-xs sm:text-sm">
              © 2024 Account Cleaner. Take control of your digital footprint. 🔐
            </p>
          </div>
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
