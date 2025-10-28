/**
 * Statistical Significance Utilities
 * Provides functions for calculating statistical significance in A/B tests
 * Used to determine if observed differences are meaningful or due to chance
 */

/**
 * Calculate chi-square test for two proportions (vote distribution)
 * Tests if the difference in voting preferences is statistically significant
 *
 * @param {number} aVotes - Number of votes for Variant A
 * @param {number} bVotes - Number of votes for Variant B
 * @returns {Object} - Contains chi-square statistic, p-value, and significance flags
 */
export const chiSquareTest = (aVotes, bVotes) => {
  const total = aVotes + bVotes;

  // Edge case: no votes
  if (total === 0) {
    return { chiSquare: 0, pValue: 1, significant95: false, significant99: false };
  }

  // Expected values under null hypothesis (equal preference)
  const expected = total / 2;

  // Chi-square statistic: sum of (observed - expected)^2 / expected
  const chiSquare = Math.pow(aVotes - expected, 2) / expected +
                    Math.pow(bVotes - expected, 2) / expected;

  // Calculate p-value from chi-square distribution (df=1)
  // Using approximation for chi-square CDF
  const pValue = 1 - chiSquareCDF(chiSquare, 1);

  return {
    chiSquare: chiSquare.toFixed(3),
    pValue: pValue.toFixed(4),
    significant95: pValue < 0.05,  // 95% confidence level
    significant99: pValue < 0.01,  // 99% confidence level
  };
};

/**
 * Calculate two-sample t-test for click likelihood scores
 * Tests if the difference in average click likelihood is statistically significant
 *
 * @param {Array} scoresA - Array of click likelihood scores for Variant A
 * @param {Array} scoresB - Array of click likelihood scores for Variant B
 * @returns {Object} - Contains t-statistic, p-value, and significance flags
 */
export const tTest = (scoresA, scoresB) => {
  const n1 = scoresA.length;
  const n2 = scoresB.length;

  // Edge cases
  if (n1 === 0 || n2 === 0) {
    return { tStatistic: 0, pValue: 1, significant95: false, significant99: false };
  }

  // Calculate means
  const mean1 = scoresA.reduce((sum, val) => sum + val, 0) / n1;
  const mean2 = scoresB.reduce((sum, val) => sum + val, 0) / n2;

  // Calculate variances
  const variance1 = scoresA.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / (n1 - 1);
  const variance2 = scoresB.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / (n2 - 1);

  // Pooled standard error
  const se = Math.sqrt(variance1 / n1 + variance2 / n2);

  // T-statistic
  const tStatistic = (mean1 - mean2) / se;

  // Degrees of freedom (Welch's approximation)
  const df = Math.pow(variance1 / n1 + variance2 / n2, 2) /
    (Math.pow(variance1 / n1, 2) / (n1 - 1) + Math.pow(variance2 / n2, 2) / (n2 - 1));

  // Calculate two-tailed p-value
  const pValue = 2 * (1 - tCDF(Math.abs(tStatistic), df));

  return {
    tStatistic: tStatistic.toFixed(3),
    pValue: pValue.toFixed(4),
    degreesOfFreedom: Math.round(df),
    significant95: pValue < 0.05,
    significant99: pValue < 0.01,
    meanDifference: (mean1 - mean2).toFixed(3),
  };
};

/**
 * Chi-square cumulative distribution function (CDF)
 * Approximation for calculating p-values
 *
 * @param {number} x - Chi-square statistic
 * @param {number} df - Degrees of freedom
 * @returns {number} - Cumulative probability
 */
const chiSquareCDF = (x, df) => {
  if (x <= 0) return 0;
  if (df === 1) {
    // For df=1, chi-square distribution is related to standard normal
    // P(χ² < x) = P(|Z| < √x) = 2Φ(√x) - 1
    return 2 * normalCDF(Math.sqrt(x)) - 1;
  }
  // Simplified approximation for small df
  return normalCDF((Math.pow(x / df, 1/3) - (1 - 2/(9*df))) / Math.sqrt(2/(9*df)));
};

/**
 * Student's t cumulative distribution function (CDF)
 * Approximation for calculating p-values
 *
 * @param {number} t - T-statistic
 * @param {number} df - Degrees of freedom
 * @returns {number} - Cumulative probability
 */
const tCDF = (t, df) => {
  // For large df (>30), t-distribution approximates normal distribution
  if (df > 30) {
    return normalCDF(t);
  }

  // Approximation using relationship to beta distribution
  const x = df / (df + t * t);
  const a = df / 2;
  const b = 0.5;

  // Incomplete beta function approximation
  let result = 0.5;
  if (t > 0) {
    result = 1 - 0.5 * incompleteBeta(x, a, b);
  } else {
    result = 0.5 * incompleteBeta(x, a, b);
  }

  return result;
};

/**
 * Standard normal cumulative distribution function (CDF)
 *
 * @param {number} z - Z-score
 * @returns {number} - Cumulative probability
 */
const normalCDF = (z) => {
  // Approximation of the standard normal CDF
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

  return z > 0 ? 1 - prob : prob;
};

/**
 * Incomplete beta function approximation
 * Used in t-distribution calculations
 *
 * @param {number} x - Value
 * @param {number} a - Parameter a
 * @param {number} b - Parameter b
 * @returns {number} - Incomplete beta value
 */
const incompleteBeta = (x, a, b) => {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  // Simple approximation for common cases
  if (a > 10 && b > 10) {
    // Normal approximation
    const mu = a / (a + b);
    const sigma = Math.sqrt(a * b / ((a + b) * (a + b) * (a + b + 1)));
    return normalCDF((x - mu) / sigma);
  }

  // For small a and b, use series expansion
  let sum = 0;
  let term = Math.pow(x, a) * Math.pow(1 - x, b) / a;

  for (let i = 0; i < 100; i++) {
    sum += term;
    term *= (a + b + i) * x / ((a + i + 1) * (1 - x));
    if (Math.abs(term) < 1e-10) break;
  }

  return Math.min(Math.max(sum, 0), 1);
};

/**
 * Calculate confidence interval for a proportion
 *
 * @param {number} successes - Number of successes (e.g., votes for A)
 * @param {number} total - Total sample size
 * @param {number} confidenceLevel - Confidence level (e.g., 0.95 for 95%)
 * @returns {Object} - Contains lower and upper bounds of confidence interval
 */
export const proportionConfidenceInterval = (successes, total, confidenceLevel = 0.95) => {
  if (total === 0) return { lower: 0, upper: 0 };

  const p = successes / total;
  const z = confidenceLevel === 0.99 ? 2.576 : 1.96; // Z-score for 95% or 99%
  const se = Math.sqrt(p * (1 - p) / total);

  return {
    lower: Math.max(0, p - z * se),
    upper: Math.min(1, p + z * se),
    estimate: p,
  };
};

/**
 * Interpret statistical significance for students
 *
 * @param {number} pValue - P-value from test
 * @returns {string} - Human-readable interpretation
 */
export const interpretPValue = (pValue) => {
  if (pValue < 0.01) {
    return 'Highly significant (p < 0.01): Very strong evidence that the difference is real, not due to chance. 99% confident.';
  } else if (pValue < 0.05) {
    return 'Significant (p < 0.05): Strong evidence that the difference is real. 95% confident.';
  } else if (pValue < 0.10) {
    return 'Marginally significant (p < 0.10): Some evidence of a difference, but not conclusive.';
  } else {
    return 'Not significant (p ≥ 0.10): Insufficient evidence to conclude a real difference exists. Results may be due to chance.';
  }
};

/**
 * Calculate effect size (Cohen's h for proportions)
 * Measures the magnitude of difference between two proportions
 *
 * @param {number} p1 - Proportion 1
 * @param {number} p2 - Proportion 2
 * @returns {Object} - Contains effect size and interpretation
 */
export const effectSize = (p1, p2) => {
  // Cohen's h: 2 * (arcsin(√p1) - arcsin(√p2))
  const h = 2 * (Math.asin(Math.sqrt(p1)) - Math.asin(Math.sqrt(p2)));

  let interpretation = '';
  const absH = Math.abs(h);
  if (absH < 0.2) {
    interpretation = 'Small effect';
  } else if (absH < 0.5) {
    interpretation = 'Medium effect';
  } else {
    interpretation = 'Large effect';
  }

  return {
    cohensH: h.toFixed(3),
    magnitude: interpretation,
  };
};
