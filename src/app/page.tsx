// app/page.tsx
"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SpreadsheetCreator from "@/components/SpreadsheetCreator";
import ExpensesDashboard from "@/components/ExpensesDashboard";
import { X } from 'lucide-react';

type AppState = 'auth' | 'create-sheet' | 'dashboard';

interface UserSheet {
  id: string;
  name: string;
  createdAt: string;
}

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentState, setCurrentState] = useState<AppState>('auth');
  const [spreadsheetId, setSpreadsheetId] = useState<string>("");
  const [userSheets, setUserSheets] = useState<UserSheet[]>([]);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    sheetId: string | null;
    sheetName: string;
  }>({
    isOpen: false,
    sheetId: null,
    sheetName: ''
  });

  // Load user's existing sheets on sign in
  useEffect(() => {
    if (session) {
      loadUserSheets();
    }
  }, [session]);

  const loadUserSheets = async () => {
    try {
      const savedSheets = localStorage.getItem(`user_sheets_${session?.user?.email}`);
      if (savedSheets) {
        const parsedSheets = JSON.parse(savedSheets);
        const validSheets = parsedSheets.filter((sheet: any) => 
          sheet && sheet.id && typeof sheet.id === 'string' && sheet.name && typeof sheet.name === 'string'
        );
        setUserSheets(validSheets);
      }
    } catch (error) {
      console.error('Error loading user sheets:', error);
      setUserSheets([]);
    }
  };

  const saveUserSheet = (sheetId: string, sheetName: string) => {
    const userEmail = session?.user?.email;
    if (!userEmail || !sheetId || typeof sheetId !== 'string' || !sheetName) return;

    const newSheet: UserSheet = {
      id: sheetId,
      name: sheetName,
      createdAt: new Date().toISOString()
    };

    const updatedSheets = [...userSheets, newSheet];
    setUserSheets(updatedSheets);
    localStorage.setItem(`user_sheets_${userEmail}`, JSON.stringify(updatedSheets));
  };

  // Delete modal functions
  const openDeleteModal = (sheetId: string, sheetName: string) => {
    setDeleteModal({
      isOpen: true,
      sheetId,
      sheetName
    });
  };

  const handleDeleteSheet = () => {
    if (!deleteModal.sheetId) return;
    
    const userEmail = session?.user?.email;
    if (!userEmail) return;

    const updatedSheets = userSheets.filter(sheet => sheet.id !== deleteModal.sheetId);
    setUserSheets(updatedSheets);
    localStorage.setItem(`user_sheets_${userEmail}`, JSON.stringify(updatedSheets));
    
    setDeleteModal({
      isOpen: false,
      sheetId: null,
      sheetName: ''
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      sheetId: null,
      sheetName: ''
    });
  };

  // Safe function to get display ID
  const getDisplayId = (sheetId: any) => {
    if (!sheetId || typeof sheetId !== 'string') {
      return 'Invalid ID';
    }
    return sheetId.substring(0, 20) + '...';
  };

  // Auto-open spreadsheet when created or selected
  const openSpreadsheet = (sheetId: string) => {
    if (sheetId && typeof sheetId === 'string') {
      window.open(`https://docs.google.com/spreadsheets/d/${sheetId}`, '_blank');
    }
  };

  const handleSheetCreated = (sheetId: string, sheetName: string) => {
    if (!sheetId || typeof sheetId !== 'string') {
      console.error('Invalid sheet ID received:', sheetId);
      return;
    }
    setSpreadsheetId(sheetId);
    saveUserSheet(sheetId, sheetName);
    openSpreadsheet(sheetId);
    setCurrentState('dashboard');
  };

  const handleSelectExistingSheet = (sheetId: string) => {
    if (!sheetId || typeof sheetId !== 'string') {
      console.error('Invalid sheet ID selected:', sheetId);
      return;
    }
    setSpreadsheetId(sheetId);
    openSpreadsheet(sheetId);
    setCurrentState('dashboard');
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Google Sheets Expense Manager</h1>
            <button
              onClick={() => signIn("google")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Sign In
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Track Your Expenses with
            <br />
            Google Sheets Integration
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A powerful expense tracking solution that seamlessly syncs with Google Sheets.
            Keep your finances organized and accessible from anywhere.
          </p>
          <button
            onClick={() => signIn("google")}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            Login with Google
          </button>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Easy Expense Tracking",
                description: "Add, edit, and delete expenses with a user-friendly interface",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                ),
              },
              {
                title: "Google Sheets Integration",
                description: "Automatically sync your expenses with Google Sheets",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              {
                title: "Smart Search",
                description: "Quickly find expenses with powerful search capabilities",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
              },
              {
                title: "Secure Authentication",
                description: "Safe and secure login with your Google account",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* App Preview Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t">
          <div className="container mx-auto px-4 py-8">
            <p className="text-center text-gray-600">
              © 2025 Google Sheets Expense Manager. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // Show only spreadsheet creation options (no navbar)
  if (currentState === 'auth') {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl w-full">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Expense-Manager-Beta
              </h1>
              <p className="text-gray-600">
                Welcome, {session.user?.name}! Choose an option to get started.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Create New Spreadsheet */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
                <div className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Create New Spreadsheet</h3>
                  <p className="text-gray-600 mb-4">Start fresh with a new expense tracking template</p>
                  <button
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium w-full"
                    onClick={() => setCurrentState('create-sheet')}
                  >
                    Create New Sheet
                  </button>
                </div>
              </div>

              {/* Existing Sheets */}
              <div className="border-2 border-gray-200 rounded-lg p-6">
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">My Spreadsheets</h3>
                  
                  {userSheets.length > 0 ? (
                    <>
                      <p className="text-gray-600 mb-4">Open an existing spreadsheet</p>
                      <div className="space-y-2 mb-4">
                        {userSheets.map((sheet) => (
                          <div key={sheet.id} className="flex items-center justify-between w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
                            <button
                              onClick={() => handleSelectExistingSheet(sheet.id)}
                              className="flex-1 text-left"
                              disabled={!sheet.id || typeof sheet.id !== 'string'}
                            >
                              <div className="font-medium text-gray-900">
                                {sheet.name}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                ID: {getDisplayId(sheet.id)}
                              </div>
                            </button>
                            
                            <button
                              onClick={() => openDeleteModal(sheet.id, sheet.name)}
                              className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete from list"
                              disabled={!sheet.id}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 mb-4">No existing spreadsheets found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

 {/* Delete Confirmation Modal - Transparent background */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full border-2 border-gray-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Spreadsheet
                </h3>
                <button
                  onClick={closeDeleteModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                
                <p className="text-gray-600 text-center mb-2">
                  Are you sure you want to remove this spreadsheet from your list?
                </p>
                <p className="text-sm text-gray-500 text-center mb-4">
                  This will remove "<span className="font-medium">{deleteModal.sheetName}</span>" from your list.
                  <br />
                  <span className="text-xs">(The actual Google Sheet will not be deleted)</span>
                </p>
              </div>
              
              {/* Modal Footer */}
              <div className="flex gap-3 p-6 border-t">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSheet}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Show spreadsheet creator (no navbar and no back arrow)
  if (currentState === 'create-sheet') {
    return (
      <SpreadsheetCreator 
        onSheetCreated={handleSheetCreated}
        showBackButton={false}
      />
    );
  }

  // Show dashboard with navbar
  if (currentState === 'dashboard' && spreadsheetId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentState('auth')}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Sheets
                </button>
                <span className="text-gray-300">|</span>
                <h1 className="text-xl font-bold text-gray-900">
                  Expense-Manager-Beta
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                </div>
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
        
        <ExpensesDashboard spreadsheetId={spreadsheetId} />
      </div>
    );
  }

  return null;
}