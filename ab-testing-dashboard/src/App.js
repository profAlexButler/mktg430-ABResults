import React, { useState, useEffect } from 'react';
import { loadAllData } from './services/dataService';
import Overview from './components/Overview';
import TestResults from './components/TestResults';
import StudentAnalysis from './components/StudentAnalysis';
import QualitativeInsights from './components/QualitativeInsights';
import PatternsInsights from './components/PatternsInsights';
import './App.css';

/**
 * Main App Component
 * RIT A/B Testing Workshop Dashboard
 * Provides interactive analysis of student voting patterns and test results
 */
function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Load all CSV data on component mount
    const fetchData = async () => {
      try {
        setLoading(true);
        const allData = await loadAllData();
        setData(allData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data. Please refresh the page.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'tests', label: 'Test Results', icon: '🧪' },
    { id: 'students', label: 'Student Analysis', icon: '👥' },
    { id: 'insights', label: 'Qualitative Insights', icon: '💬' },
    { id: 'patterns', label: 'Patterns & Insights', icon: '📈' },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-rit-orange mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading A/B testing data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-800 text-lg font-semibold mb-2">Error Loading Data</p>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <Overview data={data} />;
      case 'tests':
        return <TestResults data={data} />;
      case 'students':
        return <StudentAnalysis data={data} />;
      case 'insights':
        return <QualitativeInsights data={data} />;
      case 'patterns':
        return <PatternsInsights data={data} />;
      default:
        return <Overview data={data} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b-4 border-rit-orange">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            RIT A/B Testing Workshop Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Social Media Marketing Class - Interactive Results Analysis
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 md:px-6 py-4 text-sm md:text-base font-medium whitespace-nowrap
                  border-b-4 transition-all duration-200
                  ${
                    activeTab === tab.id
                      ? 'border-rit-orange text-rit-orange bg-orange-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>RIT Social Media Marketing Class | A/B Testing Workshop Results</p>
          <p className="text-sm mt-1">22 Students | 18 Tests | 396 Total Responses</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
