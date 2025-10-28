import React, { useState, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { exportToCSV } from '../services/dataService';

/**
 * Student Analysis Component
 * Displays individual student voting patterns and behaviors
 * - Sortable student table
 * - Scatter plot of bias vs engagement
 * - Heatmap of student votes by test
 */
const StudentAnalysis = ({ data }) => {
  const { studentPatterns, masterDataset, testSummary } = data;

  const [sortConfig, setSortConfig] = useState({ key: 'Comment Rate %', direction: 'desc' });
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Sorting function
  const sortedStudents = useMemo(() => {
    let sorted = [...studentPatterns];

    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return sorted;
  }, [studentPatterns, sortConfig]);

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

  // Scatter plot data: bias score vs comment engagement
  const scatterData = studentPatterns.map(student => ({
    name: student['Student Name'],
    biasScore: parseFloat(student['Bias Score']) || 0,
    commentRate: parseFloat(student['Comment Rate %']) || 0,
    avgLikelihood: parseFloat(student['Avg Click Likelihood']) || 0,
  }));

  // Heatmap data: students x tests
  const testNames = testSummary.map(t => t['Test Name']);
  const heatmapData = studentPatterns.map(student => {
    const studentName = student['Student Name'];
    const studentVotes = masterDataset.filter(r => r['Student Name'] === studentName);

    const votes = {};
    testNames.forEach(testName => {
      const vote = studentVotes.find(v => v['Test Name'] === testName);
      votes[testName] = vote ? vote['Variant Selected'] : null;
    });

    return {
      student: studentName,
      ...votes,
    };
  });

  const getStudentHistory = (studentName) => {
    return masterDataset.filter(r => r['Student Name'] === studentName);
  };

  const handleExport = () => {
    exportToCSV(sortedStudents, 'student-patterns.csv');
  };

  const getBiasColor = (biasScore) => {
    const score = parseFloat(biasScore) || 0;
    if (score > 30) return 'text-orange-600 font-bold';
    if (score > 10) return 'text-orange-500';
    if (score < -30) return 'text-blue-600 font-bold';
    if (score < -10) return 'text-blue-500';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Student Analysis</h2>
        <p className="text-gray-600">
          Individual student voting patterns, biases, and engagement levels. Click a student name to see their voting history.
        </p>
      </div>

      {/* Scatter Plot */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Bias Score vs Comment Engagement</h3>
            <p className="text-sm text-gray-600 mt-1">
              Bias Score: Positive = prefers Variant A, Negative = prefers Variant B
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="biasScore"
              name="Bias Score"
              label={{ value: 'Bias Score (% preference for A vs B)', position: 'bottom', offset: 40 }}
              domain={[-30, 80]}
            />
            <YAxis
              type="number"
              dataKey="commentRate"
              name="Comment Rate"
              label={{ value: 'Comment Engagement %', angle: -90, position: 'insideLeft' }}
              domain={[0, 100]}
            />
            <ZAxis type="number" dataKey="avgLikelihood" range={[50, 400]} name="Avg Click Likelihood" />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                      <p className="font-semibold text-gray-800">{data.name}</p>
                      <p className="text-sm text-gray-600">Bias Score: {data.biasScore}%</p>
                      <p className="text-sm text-gray-600">Comment Rate: {data.commentRate}%</p>
                      <p className="text-sm text-gray-600">Avg Click: {data.avgLikelihood.toFixed(2)}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter data={scatterData} fill="#F76902" />
          </ScatterChart>
        </ResponsiveContainer>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Interpretation:</strong> Students in the top-right have strong A-preference and high engagement.
            Students on the left prefer Variant B. Bubble size represents average click likelihood scores.
          </p>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Student Voting Patterns</h3>
          <button
            onClick={handleExport}
            className="bg-rit-orange text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors text-sm font-medium"
          >
            📥 Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('Total Responses')}
                >
                  Responses {getSortIcon('Total Responses')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('Variant A %')}
                >
                  A% {getSortIcon('Variant A %')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('Variant B %')}
                >
                  B% {getSortIcon('Variant B %')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('Bias Score')}
                >
                  Bias {getSortIcon('Bias Score')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('Avg Click Likelihood')}
                >
                  Avg Click {getSortIcon('Avg Click Likelihood')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('Comment Rate %')}
                >
                  Comment % {getSortIcon('Comment Rate %')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedStudents.map((student, index) => (
                <React.Fragment key={index}>
                  <tr
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedStudent(selectedStudent === student['Student Name'] ? null : student['Student Name'])}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student['Student Name']}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {student['Total Responses']}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {student['Variant A %']}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {student['Variant B %']}%
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${getBiasColor(student['Bias Score'])}`}>
                      {student['Bias Score']}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {parseFloat(student['Avg Click Likelihood']).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {student['Comment Rate %']}% ({student['Comments Left']})
                    </td>
                  </tr>

                  {/* Expanded Student History */}
                  {selectedStudent === student['Student Name'] && (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 bg-gray-50">
                        <div className="space-y-3">
                          <h4 className="font-bold text-gray-800 mb-3">
                            {student['Student Name']}'s Voting History
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                            {getStudentHistory(student['Student Name']).map((vote, idx) => (
                              <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                                <div className="font-medium text-sm text-gray-800 mb-1">
                                  {vote['Test Name']}
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className={`px-2 py-1 rounded ${
                                    vote['Variant Selected'] === 'Variant A'
                                      ? 'bg-orange-100 text-orange-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {vote['Variant Selected']}
                                  </span>
                                  <span className="text-gray-600">
                                    Clicks: A={vote['Variant A Click Likelihood']}, B={vote['Variant B Click Likelihood']}
                                  </span>
                                </div>
                                {vote.Comment && (
                                  <p className="text-xs text-gray-600 mt-2 italic">"{vote.Comment}"</p>
                                )}
                              </div>
                            ))}
                          </div>
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

      {/* Heatmap */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Student x Test Heatmap</h3>
        <p className="text-sm text-gray-600 mb-4">
          Orange = chose Variant A, Gray = chose Variant B, White = no response
        </p>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="flex">
              {/* Student names column */}
              <div className="flex-shrink-0" style={{ width: '150px' }}>
                <div className="h-8 border-b border-gray-300"></div>
                {heatmapData.map((row, idx) => (
                  <div
                    key={idx}
                    className="h-8 border-b border-gray-200 px-2 flex items-center text-xs font-medium text-gray-700 bg-gray-50"
                  >
                    {row.student}
                  </div>
                ))}
              </div>

              {/* Test columns */}
              <div className="flex-grow overflow-x-auto">
                <div className="flex">
                  {testNames.map((testName, testIdx) => (
                    <div key={testIdx} className="flex-shrink-0" style={{ width: '80px' }}>
                      <div className="h-8 border-b border-gray-300 px-1">
                        <div
                          className="text-xs text-gray-700 font-medium truncate"
                          title={testName}
                          style={{
                            transform: 'rotate(-45deg)',
                            transformOrigin: 'left bottom',
                            whiteSpace: 'nowrap',
                            marginTop: '20px',
                            marginLeft: '10px'
                          }}
                        >
                          {testName.replace('ImageTest - ', 'I:').replace('CopyTest - ', 'C:')}
                        </div>
                      </div>
                      {heatmapData.map((row, rowIdx) => {
                        const variant = row[testName];
                        const bgColor = variant === 'Variant A' ? 'bg-orange-400' :
                                       variant === 'Variant B' ? 'bg-gray-400' : 'bg-white';
                        return (
                          <div
                            key={rowIdx}
                            className={`h-8 border-b border-r border-gray-200 ${bgColor}`}
                            title={`${row.student} - ${testName}: ${variant || 'No response'}`}
                          >
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalysis;
