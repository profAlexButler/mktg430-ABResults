import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { exportToCSV } from '../services/dataService';

/**
 * Test Results Component
 * Displays detailed test results with sorting, filtering, and expandable rows
 * Shows vote distribution, click likelihood, and comments for each test
 */
const TestResults = ({ data }) => {
  const { testSummary, allComments } = data;

  const [sortConfig, setSortConfig] = useState({ key: 'Consensus Score', direction: 'desc' });
  const [filterType, setFilterType] = useState('all');
  const [filterWinner, setFilterWinner] = useState('all');
  const [consensusThreshold, setConsensusThreshold] = useState(0);
  const [expandedTest, setExpandedTest] = useState(null);

  // Sorting function
  const sortedTests = useMemo(() => {
    let filteredTests = [...testSummary];

    // Apply filters
    if (filterType !== 'all') {
      filteredTests = filteredTests.filter(test => test['Test Type'] === filterType);
    }
    if (filterWinner !== 'all') {
      filteredTests = filteredTests.filter(test => test.Winner === filterWinner);
    }
    filteredTests = filteredTests.filter(test => (parseFloat(test['Consensus Score']) || 0) >= consensusThreshold);

    // Apply sorting
    if (sortConfig.key) {
      filteredTests.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle numeric values
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Handle string values
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredTests;
  }, [testSummary, sortConfig, filterType, filterWinner, consensusThreshold]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return '↕️';
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const toggleExpand = (testName) => {
    setExpandedTest(expandedTest === testName ? null : testName);
  };

  const getTestComments = (testName) => {
    return allComments.filter(comment => comment['Test Name'] === testName && comment.Comment);
  };

  const getVoteDistributionData = (test) => {
    return [
      {
        name: 'Variant A',
        Votes: test['Variant A Votes'],
        percentage: test['Variant A %'],
        fill: '#F76902',
      },
      {
        name: 'Variant B',
        Votes: test['Variant B Votes'],
        percentage: test['Variant B %'],
        fill: '#6B7280',
      },
    ];
  };

  const getClickLikelihoodData = (test) => {
    return [
      {
        variant: 'Variant A',
        'Avg Click Likelihood': parseFloat(test['Avg Click Likelihood A']) || 0,
        fill: '#F76902',
      },
      {
        variant: 'Variant B',
        'Avg Click Likelihood': parseFloat(test['Avg Click Likelihood B']) || 0,
        fill: '#6B7280',
      },
    ];
  };

  const handleExport = () => {
    exportToCSV(sortedTests, 'test-results-filtered.csv');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Test Results</h2>
        <p className="text-gray-600">
          Detailed results for all A/B tests. Click any row to see vote distribution, click likelihood, and comments.
        </p>
      </div>

      {/* Filters and Export */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Test Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-rit-orange focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="Image">Image</option>
              <option value="Copy">Copy</option>
              <option value="Copy/Audience">Copy/Audience</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Winner</label>
            <select
              value={filterWinner}
              onChange={(e) => setFilterWinner(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-rit-orange focus:border-transparent"
            >
              <option value="all">All Winners</option>
              <option value="Variant A">Variant A</option>
              <option value="Variant B">Variant B</option>
              <option value="Tie">Tie</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Consensus: {consensusThreshold}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={consensusThreshold}
              onChange={(e) => setConsensusThreshold(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={handleExport}
            className="bg-rit-orange text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors font-medium"
          >
            📥 Export CSV
          </button>
        </div>

        <p className="text-sm text-gray-600 mt-4">
          Showing {sortedTests.length} of {testSummary.length} tests
        </p>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Name
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('Test Type')}
                >
                  Type {getSortIcon('Test Type')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('Winner')}
                >
                  Winner {getSortIcon('Winner')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('Vote Margin')}
                >
                  Vote Margin {getSortIcon('Vote Margin')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('Consensus Score')}
                >
                  Consensus {getSortIcon('Consensus Score')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('Likelihood Gap (A-B)')}
                >
                  Click Gap {getSortIcon('Likelihood Gap (A-B)')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comments
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTests.map((test, index) => (
                <React.Fragment key={index}>
                  <tr
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => toggleExpand(test['Test Name'])}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {test['Test Name']}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        test['Test Type'] === 'Image' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {test['Test Type']}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded font-medium ${
                        test.Winner === 'Variant A' ? 'bg-orange-100 text-orange-800' :
                        test.Winner === 'Variant B' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {test.Winner}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {test['Vote Margin']} ({test['Margin %']}%)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-rit-orange h-2 rounded-full"
                            style={{ width: `${test['Consensus Score']}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {test['Consensus Score']}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className={parseFloat(test['Likelihood Gap (A-B)']) > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {parseFloat(test['Likelihood Gap (A-B)']).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {test['Comments Count']}
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedTest === test['Test Name'] && (
                    <tr>
                      <td colSpan="7" className="px-6 py-6 bg-gray-50">
                        <div className="space-y-6">
                          <h4 className="text-lg font-bold text-gray-800 mb-4">
                            {test['Test Name']} - Detailed Analysis
                          </h4>

                          {/* Charts */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Vote Distribution */}
                            <div className="bg-white p-4 rounded-lg shadow">
                              <h5 className="font-semibold text-gray-700 mb-3">Vote Distribution</h5>
                              <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={getVoteDistributionData(test)}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis />
                                  <Tooltip />
                                  <Bar dataKey="Votes" fill="#8884d8" />
                                </BarChart>
                              </ResponsiveContainer>
                              <div className="mt-2 text-sm text-gray-600">
                                A: {test['Variant A %']}% | B: {test['Variant B %']}%
                              </div>
                            </div>

                            {/* Click Likelihood */}
                            <div className="bg-white p-4 rounded-lg shadow">
                              <h5 className="font-semibold text-gray-700 mb-3">Avg Click Likelihood (1-5)</h5>
                              <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={getClickLikelihoodData(test)}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="variant" />
                                  <YAxis domain={[0, 5]} />
                                  <Tooltip />
                                  <Bar dataKey="Avg Click Likelihood" fill="#8884d8" />
                                </BarChart>
                              </ResponsiveContainer>
                              <div className="mt-2 text-sm text-gray-600">
                                Gap: {test['Likelihood Gap (A-B)']} (A favored: {parseFloat(test['Likelihood Gap (A-B)']) > 0 ? 'Yes' : 'No'})
                              </div>
                            </div>
                          </div>

                          {/* Comments */}
                          {getTestComments(test['Test Name']).length > 0 && (
                            <div className="bg-white p-4 rounded-lg shadow">
                              <h5 className="font-semibold text-gray-700 mb-3">
                                Comments ({getTestComments(test['Test Name']).length})
                              </h5>
                              <div className="space-y-3 max-h-64 overflow-y-auto">
                                {getTestComments(test['Test Name']).map((comment, idx) => (
                                  <div key={idx} className="border-l-4 border-rit-orange pl-4 py-2">
                                    <div className="flex justify-between items-start mb-1">
                                      <span className="font-medium text-sm text-gray-700">
                                        {comment['Student Name']}
                                      </span>
                                      <span className={`text-xs px-2 py-1 rounded ${
                                        comment['Variant Selected'] === 'Variant A'
                                          ? 'bg-orange-100 text-orange-800'
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        Chose: {comment['Variant Selected']}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600">{comment.Comment}</p>
                                    <div className="text-xs text-gray-500 mt-1">
                                      Click scores: A={comment['Variant A Click Likelihood']}, B={comment['Variant B Click Likelihood']}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TestResults;
