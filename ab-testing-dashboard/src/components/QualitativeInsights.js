import React, { useState, useMemo } from 'react';
import { exportToCSV } from '../services/dataService';

/**
 * Qualitative Insights Component
 * Displays all student comments with filtering and search capabilities
 * Organized by test with context about which variant was selected
 */
const QualitativeInsights = ({ data }) => {
  const { allComments, testSummary } = data;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTest, setFilterTest] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterVariant, setFilterVariant] = useState('all');
  const [filterStudent, setFilterStudent] = useState('all');

  // Get unique values for filters
  const uniqueTests = [...new Set(allComments.map(c => c['Test Name']))].sort();
  const uniqueStudents = [...new Set(allComments.map(c => c['Student Name']))].sort();
  const uniqueTypes = [...new Set(allComments.map(c => c['Test Type']))];

  // Filtered comments
  const filteredComments = useMemo(() => {
    return allComments.filter(comment => {
      // Only show comments that have text
      if (!comment.Comment || comment.Comment.trim() === '') return false;

      // Search filter
      if (searchTerm && !comment.Comment.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Test filter
      if (filterTest !== 'all' && comment['Test Name'] !== filterTest) {
        return false;
      }

      // Type filter
      if (filterType !== 'all' && comment['Test Type'] !== filterType) {
        return false;
      }

      // Variant filter
      if (filterVariant !== 'all' && comment['Variant Selected'] !== filterVariant) {
        return false;
      }

      // Student filter
      if (filterStudent !== 'all' && comment['Student Name'] !== filterStudent) {
        return false;
      }

      return true;
    });
  }, [allComments, searchTerm, filterTest, filterType, filterVariant, filterStudent]);

  // Group comments by test
  const commentsByTest = useMemo(() => {
    const grouped = {};
    filteredComments.forEach(comment => {
      const testName = comment['Test Name'];
      if (!grouped[testName]) {
        grouped[testName] = [];
      }
      grouped[testName].push(comment);
    });
    return grouped;
  }, [filteredComments]);

  const handleExport = () => {
    exportToCSV(filteredComments, 'comments-filtered.csv');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterTest('all');
    setFilterType('all');
    setFilterVariant('all');
    setFilterStudent('all');
  };

  const getTestDetails = (testName) => {
    return testSummary.find(t => t['Test Name'] === testName);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Qualitative Insights</h2>
        <p className="text-gray-600">
          Student comments and feedback organized by test. Filter and search to find specific insights.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Filters</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Comments
            </label>
            <input
              type="text"
              placeholder="Search in comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-rit-orange focus:border-transparent"
            />
          </div>

          {/* Test filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Test</label>
            <select
              value={filterTest}
              onChange={(e) => setFilterTest(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-rit-orange focus:border-transparent"
            >
              <option value="all">All Tests</option>
              {uniqueTests.map(test => (
                <option key={test} value={test}>{test}</option>
              ))}
            </select>
          </div>

          {/* Type filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Test Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-rit-orange focus:border-transparent"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Variant filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Variant Selected</label>
            <select
              value={filterVariant}
              onChange={(e) => setFilterVariant(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-rit-orange focus:border-transparent"
            >
              <option value="all">All Variants</option>
              <option value="Variant A">Variant A</option>
              <option value="Variant B">Variant B</option>
            </select>
          </div>

          {/* Student filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
            <select
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-rit-orange focus:border-transparent"
            >
              <option value="all">All Students</option>
              {uniqueStudents.map(student => (
                <option key={student} value={student}>{student}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredComments.length} of {allComments.filter(c => c.Comment && c.Comment.trim()).length} comments
          </p>
          <div className="flex gap-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Clear Filters
            </button>
            <button
              onClick={handleExport}
              className="bg-rit-orange text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              📥 Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Comments by Test */}
      <div className="space-y-6">
        {Object.keys(commentsByTest).length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No comments match your filters</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-rit-orange hover:underline font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          Object.entries(commentsByTest).map(([testName, comments]) => {
            const testDetails = getTestDetails(testName);
            return (
              <div key={testName} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Test Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{testName}</h3>
                      {testDetails && (
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            testDetails['Test Type'] === 'Image' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {testDetails['Test Type']}
                          </span>
                          <span className="text-gray-600">
                            Winner: <span className="font-semibold">{testDetails.Winner}</span>
                          </span>
                          <span className="text-gray-600">
                            Consensus: <span className="font-semibold">{testDetails['Consensus Score']}%</span>
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-700">
                        {comments.length} comment{comments.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <div className="p-6 space-y-4">
                  {comments.map((comment, idx) => (
                    <div
                      key={idx}
                      className="border-l-4 border-rit-orange bg-gray-50 p-4 rounded-r-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-800">
                            {comment['Student Name']}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            comment['Variant Selected'] === 'Variant A'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-200 text-gray-800'
                          }`}>
                            Chose: {comment['Variant Selected']}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Click Likelihood: A={comment['Variant A Click Likelihood']}, B={comment['Variant B Click Likelihood']}
                        </div>
                      </div>

                      <p className="text-gray-700 leading-relaxed">
                        {comment.Comment}
                      </p>

                      {/* Highlight search term */}
                      {searchTerm && comment.Comment.toLowerCase().includes(searchTerm.toLowerCase()) && (
                        <div className="mt-2 text-xs text-rit-orange font-medium">
                          ✓ Matches search: "{searchTerm}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary Stats */}
      {filteredComments.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-rit-orange rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Comment Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Variant A Comments</p>
              <p className="text-2xl font-bold text-rit-orange">
                {filteredComments.filter(c => c['Variant Selected'] === 'Variant A').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Variant B Comments</p>
              <p className="text-2xl font-bold text-gray-700">
                {filteredComments.filter(c => c['Variant Selected'] === 'Variant B').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Click Likelihood</p>
              <p className="text-2xl font-bold text-gray-800">
                {(filteredComments.reduce((sum, c) =>
                  sum + (c['Variant A Click Likelihood'] + c['Variant B Click Likelihood']) / 2, 0) /
                  filteredComments.length).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualitativeInsights;
