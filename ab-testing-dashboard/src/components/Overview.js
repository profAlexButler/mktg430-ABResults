import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Overview Component
 * Displays high-level statistics and visualizations
 * - Hero stats cards
 * - Overall A vs B preference
 * - Test type comparison
 * - Winner distribution
 */
const Overview = ({ data }) => {
  const { testSummary, testTypePatterns, masterDataset } = data;

  // Calculate overall stats
  const totalTests = testSummary.length;
  const totalResponses = masterDataset.length;
  const uniqueStudents = [...new Set(masterDataset.map(r => r['Student Name']))].length;

  // Calculate response rate (total responses / expected responses)
  const expectedResponses = uniqueStudents * totalTests;
  const responseRate = ((totalResponses / expectedResponses) * 100).toFixed(1);

  // Calculate overall A vs B preference
  const totalAVotes = masterDataset.filter(r => r['Variant Selected'] === 'Variant A').length;
  const totalBVotes = masterDataset.filter(r => r['Variant Selected'] === 'Variant B').length;
  const aPercentage = ((totalAVotes / totalResponses) * 100).toFixed(1);
  const bPercentage = ((totalBVotes / totalResponses) * 100).toFixed(1);

  // Winner distribution
  const aWins = testSummary.filter(t => t.Winner === 'Variant A').length;
  const bWins = testSummary.filter(t => t.Winner === 'Variant B').length;
  const ties = testSummary.filter(t => t.Winner === 'Tie').length;

  const winnerData = [
    { name: 'Variant A Wins', value: aWins, color: '#F76902' },
    { name: 'Variant B Wins', value: bWins, color: '#6B7280' },
    { name: 'Ties', value: ties, color: '#D1D5DB' },
  ];

  // Test type comparison data
  const testTypeData = testTypePatterns.map(type => ({
    name: type['Test Type'],
    'Avg Consensus': parseFloat(type['Avg Consensus Score']) || 0,
    'Tests': type['Number of Tests'] || 0,
  }));

  // Hero stats cards
  const statsCards = [
    {
      title: 'Total Responses',
      value: totalResponses,
      subtitle: `${expectedResponses} expected`,
      icon: '📝',
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-800',
    },
    {
      title: 'Students Participated',
      value: uniqueStudents,
      subtitle: `${responseRate}% response rate`,
      icon: '👥',
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-800',
    },
    {
      title: 'Tests Conducted',
      value: totalTests,
      subtitle: `${testSummary.filter(t => t['Test Type'] === 'Image').length} Image, ${testSummary.filter(t => t['Test Type'] === 'Copy').length} Copy`,
      icon: '🧪',
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-800',
    },
    {
      title: 'Avg Consensus',
      value: `${(testSummary.reduce((sum, t) => sum + (parseFloat(t['Consensus Score']) || 0), 0) / totalTests).toFixed(1)}%`,
      subtitle: 'across all tests',
      icon: '🎯',
      color: 'bg-orange-50 border-orange-200',
      textColor: 'text-orange-800',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">
          High-level insights from the A/B testing workshop. Explore detailed analysis in other tabs.
        </p>
      </div>

      {/* Hero Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className={`${stat.color} border-2 rounded-lg p-6 shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className={`text-3xl font-bold ${stat.textColor} mb-1`}>{stat.value}</p>
            <p className="text-gray-500 text-sm">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Overall Preference Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Overall Variant Preference</h3>
        <p className="text-gray-600 mb-6 text-sm">
          Total vote distribution across all tests. Shows which variant students preferred more often.
        </p>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium text-gray-700">Variant A</span>
              <span className="font-bold text-rit-orange">{aPercentage}% ({totalAVotes} votes)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-8">
              <div
                className="bg-rit-orange h-8 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-500"
                style={{ width: `${aPercentage}%` }}
              >
                {aPercentage}%
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium text-gray-700">Variant B</span>
              <span className="font-bold text-gray-600">{bPercentage}% ({totalBVotes} votes)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-8">
              <div
                className="bg-gray-600 h-8 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-500"
                style={{ width: `${bPercentage}%` }}
              >
                {bPercentage}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Type Comparison */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Test Type Comparison</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Average consensus score by test type. Higher scores indicate more decisive results.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={testTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Avg Consensus %', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Avg Consensus" fill="#F76902" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Winner Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Winner Distribution</h3>
          <p className="text-gray-600 mb-4 text-sm">
            How many tests each variant won across all {totalTests} tests.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={winnerData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {winnerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {winnerData.map((entry, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-sm text-gray-700">{entry.name}</span>
                </div>
                <span className="text-sm font-semibold">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-rit-orange rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📌 Key Insights</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="text-rit-orange mr-2">•</span>
            <span>
              <strong>Variant A</strong> was preferred in <strong>{aPercentage}%</strong> of all votes,
              showing a {aPercentage > 50 ? 'slight preference' : 'balanced split'} in overall voting patterns.
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-rit-orange mr-2">•</span>
            <span>
              <strong>Image tests</strong> had an average consensus of <strong>{testTypeData.find(t => t.name === 'Image')?.['Avg Consensus'].toFixed(1)}%</strong>,
              while <strong>Copy tests</strong> averaged <strong>{testTypeData.find(t => t.name === 'Copy')?.['Avg Consensus'].toFixed(1)}%</strong>.
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-rit-orange mr-2">•</span>
            <span>
              Out of {totalTests} tests, Variant A won <strong>{aWins}</strong>, Variant B won <strong>{bWins}</strong>,
              and <strong>{ties}</strong> resulted in ties.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Overview;
