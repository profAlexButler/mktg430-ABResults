import React, { useMemo } from 'react';
import { chiSquareTest, tTest, interpretPValue, effectSize, proportionConfidenceInterval } from '../utils/statistics';
import { exportToCSV } from '../services/dataService';

/**
 * Statistical Significance Component
 * Educational view showing how marketers determine if A/B test results are meaningful
 * Includes chi-square tests, t-tests, p-values, and confidence intervals
 */
const StatisticalSignificance = ({ data }) => {
  const { testSummary, masterDataset } = data;

  // Calculate statistical significance for each test
  const testsWithSignificance = useMemo(() => {
    return testSummary.map(test => {
      // Chi-square test for vote distribution
      const voteTest = chiSquareTest(
        test['Variant A Votes'],
        test['Variant B Votes']
      );

      // Get click likelihood scores for this test
      const testResponses = masterDataset.filter(r => r['Test Name'] === test['Test Name']);
      const scoresA = testResponses.map(r => r['Variant A Click Likelihood']).filter(s => !isNaN(s));
      const scoresB = testResponses.map(r => r['Variant B Click Likelihood']).filter(s => !isNaN(s));

      // T-test for click likelihood difference
      const clickTest = tTest(scoresA, scoresB);

      // Effect size for vote proportions
      const effect = effectSize(
        test['Variant A %'] / 100,
        test['Variant B %'] / 100
      );

      // Confidence intervals for proportions
      const ciA = proportionConfidenceInterval(test['Variant A Votes'], test['Total Votes'], 0.95);
      const ciB = proportionConfidenceInterval(test['Variant B Votes'], test['Total Votes'], 0.95);

      return {
        ...test,
        voteTest,
        clickTest,
        effect,
        confidenceIntervals: { variantA: ciA, variantB: ciB },
      };
    });
  }, [testSummary, masterDataset]);

  // Count significant vs non-significant results
  const stats = useMemo(() => {
    const significant95Vote = testsWithSignificance.filter(t => t.voteTest.significant95).length;
    const significant99Vote = testsWithSignificance.filter(t => t.voteTest.significant99).length;
    const significant95Click = testsWithSignificance.filter(t => t.clickTest.significant95).length;
    const significant99Click = testsWithSignificance.filter(t => t.clickTest.significant99).length;

    return {
      total: testsWithSignificance.length,
      significant95Vote,
      significant99Vote,
      significant95Click,
      significant99Click,
      notSignificantVote: testsWithSignificance.length - significant95Vote,
      notSignificantClick: testsWithSignificance.length - significant95Click,
    };
  }, [testsWithSignificance]);

  const handleExport = () => {
    const exportData = testsWithSignificance.map(t => ({
      'Test Name': t['Test Name'],
      'Test Type': t['Test Type'],
      'Winner': t.Winner,
      'Variant A %': t['Variant A %'],
      'Variant B %': t['Variant B %'],
      'Chi-Square': t.voteTest.chiSquare,
      'Vote P-Value': t.voteTest.pValue,
      'Vote Significant (95%)': t.voteTest.significant95 ? 'Yes' : 'No',
      'Vote Significant (99%)': t.voteTest.significant99 ? 'Yes' : 'No',
      'T-Statistic': t.clickTest.tStatistic,
      'Click P-Value': t.clickTest.pValue,
      'Click Significant (95%)': t.clickTest.significant95 ? 'Yes' : 'No',
      'Click Significant (99%)': t.clickTest.significant99 ? 'Yes' : 'No',
      'Effect Size (Cohen\'s h)': t.effect.cohensH,
      'Effect Magnitude': t.effect.magnitude,
    }));
    exportToCSV(exportData, 'statistical-significance.csv');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Statistical Significance Analysis</h2>
        <p className="text-gray-600">
          Learn how marketers determine if A/B test results are meaningful or just due to random chance.
        </p>
      </div>

      {/* Educational Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📚 Understanding Statistical Significance</h3>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>Why it matters:</strong> In real-world marketing, we need to know if observed differences are
            <em> statistically significant</em> (likely real) or could have happened by chance.
          </p>
          <p>
            <strong>P-value:</strong> The probability that results this extreme could occur by random chance.
            Lower p-values = stronger evidence of a real difference.
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>p &lt; 0.05:</strong> Statistically significant at 95% confidence level (industry standard)</li>
            <li><strong>p &lt; 0.01:</strong> Highly significant at 99% confidence level (very strong evidence)</li>
            <li><strong>p ≥ 0.05:</strong> Not significant - results could be due to chance</li>
          </ul>
          <p>
            <strong>Two tests we use:</strong>
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>Chi-Square Test:</strong> Tests if voting preferences (A vs B) differ significantly</li>
            <li><strong>T-Test:</strong> Tests if click likelihood scores differ significantly</li>
          </ul>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border-2 border-green-200 rounded-lg p-6 shadow-sm">
          <p className="text-gray-600 text-sm font-medium mb-2">Significant Vote Tests</p>
          <p className="text-4xl font-bold text-green-600">{stats.significant95Vote}</p>
          <p className="text-sm text-gray-500 mt-1">of {stats.total} at 95% confidence</p>
        </div>

        <div className="bg-white border-2 border-emerald-200 rounded-lg p-6 shadow-sm">
          <p className="text-gray-600 text-sm font-medium mb-2">Highly Significant Votes</p>
          <p className="text-4xl font-bold text-emerald-600">{stats.significant99Vote}</p>
          <p className="text-sm text-gray-500 mt-1">of {stats.total} at 99% confidence</p>
        </div>

        <div className="bg-white border-2 border-blue-200 rounded-lg p-6 shadow-sm">
          <p className="text-gray-600 text-sm font-medium mb-2">Significant Click Tests</p>
          <p className="text-4xl font-bold text-blue-600">{stats.significant95Click}</p>
          <p className="text-sm text-gray-500 mt-1">of {stats.total} at 95% confidence</p>
        </div>

        <div className="bg-white border-2 border-red-200 rounded-lg p-6 shadow-sm">
          <p className="text-gray-600 text-sm font-medium mb-2">Not Significant</p>
          <p className="text-4xl font-bold text-red-600">{stats.notSignificantVote}</p>
          <p className="text-sm text-gray-500 mt-1">vote tests could be chance</p>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="bg-rit-orange text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors font-medium"
        >
          📥 Export Statistical Results
        </button>
      </div>

      {/* Detailed Results Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Winner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vote Split</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chi-Square P-Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vote Significant?</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Click P-Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Click Significant?</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effect Size</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {testsWithSignificance.map((test, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {test['Test Name']}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
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
                    {test['Variant A %']}% / {test['Variant B %']}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-semibold ${
                      test.voteTest.significant99 ? 'text-green-700' :
                      test.voteTest.significant95 ? 'text-green-600' :
                      'text-gray-600'
                    }`}>
                      {test.voteTest.pValue}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {test.voteTest.significant99 ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-semibold">
                        ✓ Yes (99%)
                      </span>
                    ) : test.voteTest.significant95 ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">
                        ✓ Yes (95%)
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                        ✗ No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-semibold ${
                      test.clickTest.significant99 ? 'text-blue-700' :
                      test.clickTest.significant95 ? 'text-blue-600' :
                      'text-gray-600'
                    }`}>
                      {test.clickTest.pValue}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {test.clickTest.significant99 ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold">
                        ✓ Yes (99%)
                      </span>
                    ) : test.clickTest.significant95 ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold">
                        ✓ Yes (95%)
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                        ✗ No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span className="font-medium">{test.effect.cohensH}</span>
                    <div className="text-xs text-gray-500">{test.effect.magnitude}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Examples */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📖 Example Interpretations</h3>
        <div className="space-y-4">
          {testsWithSignificance.slice(0, 3).map((test, idx) => (
            <div key={idx} className="border-l-4 border-rit-orange pl-4 py-3 bg-gray-50 rounded-r">
              <h4 className="font-bold text-gray-800 mb-2">{test['Test Name']}</h4>

              <div className="space-y-2 text-sm text-gray-700">
                <div>
                  <strong>Vote Distribution:</strong> {test['Variant A %']}% chose A, {test['Variant B %']}% chose B
                  <br />
                  <strong>Statistical Test:</strong> Chi-square = {test.voteTest.chiSquare}, p = {test.voteTest.pValue}
                  <br />
                  <span className={test.voteTest.significant95 ? 'text-green-700 font-semibold' : 'text-red-700'}>
                    {interpretPValue(parseFloat(test.voteTest.pValue))}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <strong>Click Likelihood:</strong> Mean difference = {test.clickTest.meanDifference}
                  <br />
                  <strong>Statistical Test:</strong> t = {test.clickTest.tStatistic}, p = {test.clickTest.pValue}
                  <br />
                  <span className={test.clickTest.significant95 ? 'text-blue-700 font-semibold' : 'text-red-700'}>
                    {interpretPValue(parseFloat(test.clickTest.pValue))}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <strong>Marketing Recommendation:</strong>{' '}
                  {test.voteTest.significant95 && test.clickTest.significant95 ? (
                    <span className="text-green-700 font-semibold">
                      Strong evidence to implement the winning variant. Both preference and engagement are significantly different.
                    </span>
                  ) : test.voteTest.significant95 ? (
                    <span className="text-yellow-700 font-semibold">
                      Preference is significant, but engagement metrics are inconclusive. Consider testing further or monitoring post-launch.
                    </span>
                  ) : (
                    <span className="text-red-700 font-semibold">
                      Results are not statistically significant. Either variant would likely perform similarly. Consider testing with larger sample size.
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sample Size Discussion */}
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">⚠️ Important: Sample Size Considerations</h3>
        <div className="space-y-2 text-gray-700">
          <p>
            <strong>Our Sample Size:</strong> Each test had only {testSummary[0]['Total Votes']} responses. In professional marketing,
            sample sizes are typically <strong>much larger</strong> (hundreds or thousands) to achieve statistical significance.
          </p>
          <p>
            <strong>What this means:</strong> Some of our "not significant" results might become significant with more data.
            Conversely, even a small preference difference can be significant with large enough samples.
          </p>
          <p>
            <strong>Real-world takeaway:</strong> Always consider both <em>statistical significance</em> (is it real?) and
            <em> practical significance</em> (is the difference large enough to matter?).
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatisticalSignificance;
