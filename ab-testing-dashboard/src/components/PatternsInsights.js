import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Patterns & Insights Component
 * Displays statistical analysis and patterns discovered in the data
 * - Most decisive tests
 * - Most polarizing tests
 * - Correlation analysis
 * - Brand performance patterns
 */
const PatternsInsights = ({ data }) => {
  const { testSummary } = data;

  // Most decisive tests (highest consensus scores)
  const mostDecisive = useMemo(() => {
    return [...testSummary]
      .sort((a, b) => (parseFloat(b['Consensus Score']) || 0) - (parseFloat(a['Consensus Score']) || 0))
      .slice(0, 5)
      .map(test => ({
        name: test['Test Name'].replace('ImageTest - ', 'I: ').replace('CopyTest - ', 'C: '),
        consensus: parseFloat(test['Consensus Score']) || 0,
        winner: test.Winner,
        type: test['Test Type'],
      }));
  }, [testSummary]);

  // Most polarizing tests (closest to 50/50)
  const mostPolarizing = useMemo(() => {
    return [...testSummary]
      .map(test => ({
        ...test,
        polarization: Math.abs(50 - parseFloat(test['Variant A %'] || 0)),
      }))
      .sort((a, b) => a.polarization - b.polarization)
      .slice(0, 5)
      .map(test => ({
        name: test['Test Name'].replace('ImageTest - ', 'I: ').replace('CopyTest - ', 'C: '),
        aPercent: parseFloat(test['Variant A %']) || 0,
        bPercent: parseFloat(test['Variant B %']) || 0,
        type: test['Test Type'],
      }));
  }, [testSummary]);

  // Brand performance (extract brand from test name)
  const brandPerformance = useMemo(() => {
    const brands = {};

    testSummary.forEach(test => {
      // Extract brand name (everything after "Test - ")
      const match = test['Test Name'].match(/(?:ImageTest|CopyTest) - (.+)/);
      if (match) {
        let brand = match[1].trim();
        // Handle multi-word brand names with variants
        brand = brand.split(' ')[0]; // Take first word as brand

        if (!brands[brand]) {
          brands[brand] = {
            tests: 0,
            avgConsensus: 0,
            avgClickA: 0,
            avgClickB: 0,
            aWins: 0,
            bWins: 0,
          };
        }

        brands[brand].tests++;
        brands[brand].avgConsensus += parseFloat(test['Consensus Score']) || 0;
        brands[brand].avgClickA += parseFloat(test['Avg Click Likelihood A']) || 0;
        brands[brand].avgClickB += parseFloat(test['Avg Click Likelihood B']) || 0;

        if (test.Winner === 'Variant A') brands[brand].aWins++;
        if (test.Winner === 'Variant B') brands[brand].bWins++;
      }
    });

    // Calculate averages
    Object.keys(brands).forEach(brand => {
      const count = brands[brand].tests;
      brands[brand].avgConsensus = brands[brand].avgConsensus / count;
      brands[brand].avgClickA = brands[brand].avgClickA / count;
      brands[brand].avgClickB = brands[brand].avgClickB / count;
    });

    // Convert to array and filter brands with multiple tests
    return Object.entries(brands)
      .map(([name, stats]) => ({ brand: name, ...stats }))
      .filter(b => b.tests >= 2)
      .sort((a, b) => b.avgConsensus - a.avgConsensus);
  }, [testSummary]);

  // Correlation: Click likelihood vs preference
  const correlationData = useMemo(() => {
    return testSummary.map(test => {
      const clickGap = parseFloat(test['Likelihood Gap (A-B)']) || 0;
      const voteGap = parseFloat(test['Variant A %']) - 50; // Positive = A preferred

      return {
        test: test['Test Name'].replace('ImageTest - ', 'I: ').replace('CopyTest - ', 'C: '),
        clickGap,
        voteGap,
        aligned: (clickGap > 0 && voteGap > 0) || (clickGap < 0 && voteGap < 0),
      };
    });
  }, [testSummary]);

  const alignmentRate = useMemo(() => {
    const aligned = correlationData.filter(d => d.aligned).length;
    return ((aligned / correlationData.length) * 100).toFixed(1);
  }, [correlationData]);

  // Image vs Copy deep dive
  const imageTests = testSummary.filter(t => t['Test Type'] === 'Image');
  const copyTests = testSummary.filter(t => t['Test Type'] === 'Copy');

  const avgConsensusImage = imageTests.reduce((sum, t) => sum + (parseFloat(t['Consensus Score']) || 0), 0) / imageTests.length;
  const avgConsensusCopy = copyTests.reduce((sum, t) => sum + (parseFloat(t['Consensus Score']) || 0), 0) / copyTests.length;

  const avgClickGapImage = Math.abs(imageTests.reduce((sum, t) => sum + (parseFloat(t['Likelihood Gap (A-B)']) || 0), 0) / imageTests.length);
  const avgClickGapCopy = Math.abs(copyTests.reduce((sum, t) => sum + (parseFloat(t['Likelihood Gap (A-B)']) || 0), 0) / copyTests.length);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Patterns & Insights</h2>
        <p className="text-gray-600">
          Statistical analysis revealing trends, correlations, and patterns in the A/B testing results.
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-6">
          <p className="text-blue-800 text-sm font-medium mb-2">Click-Vote Alignment</p>
          <p className="text-4xl font-bold text-blue-900">{alignmentRate}%</p>
          <p className="text-blue-700 text-xs mt-2">Tests where click likelihood matched preference</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-6">
          <p className="text-purple-800 text-sm font-medium mb-2">Avg Image Consensus</p>
          <p className="text-4xl font-bold text-purple-900">{avgConsensusImage.toFixed(1)}%</p>
          <p className="text-purple-700 text-xs mt-2">Average decisiveness for image tests</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-6">
          <p className="text-green-800 text-sm font-medium mb-2">Avg Copy Consensus</p>
          <p className="text-4xl font-bold text-green-900">{avgConsensusCopy.toFixed(1)}%</p>
          <p className="text-green-700 text-xs mt-2">Average decisiveness for copy tests</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-lg p-6">
          <p className="text-orange-800 text-sm font-medium mb-2">Most Decisive</p>
          <p className="text-2xl font-bold text-orange-900">{mostDecisive[0]?.consensus.toFixed(1)}%</p>
          <p className="text-orange-700 text-xs mt-2">{mostDecisive[0]?.name}</p>
        </div>
      </div>

      {/* Most Decisive Tests */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Most Decisive Tests</h3>
        <p className="text-sm text-gray-600 mb-4">
          Tests with the highest consensus scores - indicating clear, unanimous preferences.
        </p>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mostDecisive} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis type="category" dataKey="name" width={150} />
            <Tooltip />
            <Bar dataKey="consensus" fill="#F76902" />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 space-y-2">
          {mostDecisive.map((test, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
              <span className="font-medium text-gray-700">{test.name}</span>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs ${
                  test.type === 'Image' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {test.type}
                </span>
                <span className="font-bold text-rit-orange">{test.consensus.toFixed(1)}%</span>
                <span className="text-gray-600">Winner: {test.winner}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Most Polarizing Tests */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">⚖️ Most Polarizing Tests</h3>
        <p className="text-sm text-gray-600 mb-4">
          Tests closest to 50/50 split - where students were most divided in their preferences.
        </p>

        <div className="space-y-4">
          {mostPolarizing.map((test, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-800">{test.name}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  test.type === 'Image' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {test.type}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden flex">
                  <div
                    className="bg-rit-orange h-6 flex items-center justify-end pr-2 text-white text-xs font-semibold"
                    style={{ width: `${test.aPercent}%` }}
                  >
                    {test.aPercent > 15 && `${test.aPercent.toFixed(1)}%`}
                  </div>
                  <div
                    className="bg-gray-600 h-6 flex items-center justify-start pl-2 text-white text-xs font-semibold"
                    style={{ width: `${test.bPercent}%` }}
                  >
                    {test.bPercent > 15 && `${test.bPercent.toFixed(1)}%`}
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Variant A: {test.aPercent.toFixed(1)}%</span>
                <span>Variant B: {test.bPercent.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Performance */}
      {brandPerformance.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🏢 Brand Performance Analysis</h3>
          <p className="text-sm text-gray-600 mb-4">
            Brands with multiple tests - comparing consensus scores and click likelihood.
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tests</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Consensus</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Click (A)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Click (B)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wins</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {brandPerformance.map((brand, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{brand.brand}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{brand.tests}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="font-semibold text-rit-orange">{brand.avgConsensus.toFixed(1)}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {brand.avgClickA.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {brand.avgClickB.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      A: {brand.aWins}, B: {brand.bWins}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Image vs Copy Deep Dive */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🎨 Image vs 📝 Copy: Deep Dive</h3>
        <p className="text-sm text-gray-600 mb-6">
          Comparing how students responded to image-based tests versus copy-based tests.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 text-lg">Image Tests</h4>
            <div className="space-y-3">
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-700 mb-1">Avg Consensus</p>
                <p className="text-3xl font-bold text-purple-900">{avgConsensusImage.toFixed(1)}%</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-700 mb-1">Avg Click Likelihood Gap</p>
                <p className="text-3xl font-bold text-purple-900">{avgClickGapImage.toFixed(2)}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-700 mb-1">Total Tests</p>
                <p className="text-3xl font-bold text-purple-900">{imageTests.length}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 text-lg">Copy Tests</h4>
            <div className="space-y-3">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700 mb-1">Avg Consensus</p>
                <p className="text-3xl font-bold text-blue-900">{avgConsensusCopy.toFixed(1)}%</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700 mb-1">Avg Click Likelihood Gap</p>
                <p className="text-3xl font-bold text-blue-900">{avgClickGapCopy.toFixed(2)}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700 mb-1">Total Tests</p>
                <p className="text-3xl font-bold text-blue-900">{copyTests.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Key Finding:</strong> {avgConsensusImage > avgConsensusCopy ?
              `Image tests showed ${(avgConsensusImage - avgConsensusCopy).toFixed(1)}% higher consensus than copy tests, suggesting students had more unanimous preferences when evaluating visual content.` :
              `Copy tests showed ${(avgConsensusCopy - avgConsensusImage).toFixed(1)}% higher consensus than image tests, suggesting students had more unanimous preferences when evaluating written content.`
            }
          </p>
        </div>
      </div>

      {/* Key Insights Summary */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-rit-orange rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📌 Statistical Insights</h3>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start">
            <span className="text-rit-orange mr-2 text-xl">•</span>
            <span>
              <strong>{alignmentRate}%</strong> of tests showed alignment between click likelihood and actual preference,
              indicating students can predict their engagement behavior fairly accurately.
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-rit-orange mr-2 text-xl">•</span>
            <span>
              The most decisive test was <strong>{mostDecisive[0]?.name}</strong> with <strong>{mostDecisive[0]?.consensus.toFixed(1)}%</strong> consensus,
              while <strong>{mostPolarizing[0]?.name}</strong> was the most polarizing with a near 50/50 split.
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-rit-orange mr-2 text-xl">•</span>
            <span>
              {avgConsensusImage > avgConsensusCopy ? 'Image' : 'Copy'} tests generated stronger consensus on average,
              with an average consensus score of <strong>{Math.max(avgConsensusImage, avgConsensusCopy).toFixed(1)}%</strong> compared to{' '}
              <strong>{Math.min(avgConsensusImage, avgConsensusCopy).toFixed(1)}%</strong> for the other type.
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-rit-orange mr-2 text-xl">•</span>
            <span>
              Click likelihood gaps were larger in {avgClickGapCopy > avgClickGapImage ? 'copy' : 'image'} tests
              (<strong>{Math.max(avgClickGapCopy, avgClickGapImage).toFixed(2)}</strong> vs{' '}
              <strong>{Math.min(avgClickGapCopy, avgClickGapImage).toFixed(2)}</strong>),
              suggesting more pronounced differences in engagement intent.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PatternsInsights;
