import Papa from 'papaparse';

/**
 * Service for loading and parsing CSV data files
 * Loads all 5 CSV files containing A/B testing workshop results
 */

// Use process.env.PUBLIC_URL for GitHub Pages compatibility
const BASE_URL = process.env.PUBLIC_URL || '';

const DATA_FILES = {
  masterDataset: `${BASE_URL}/data/1_master_dataset.csv`,
  testSummary: `${BASE_URL}/data/2_test_summary.csv`,
  testTypePatterns: `${BASE_URL}/data/3_test_type_patterns.csv`,
  studentPatterns: `${BASE_URL}/data/4_student_patterns.csv`,
  allComments: `${BASE_URL}/data/5_all_comments.csv`,
};

/**
 * Load a single CSV file and parse it
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise} - Promise that resolves to parsed data
 */
const loadCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    Papa.parse(filePath, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn(`Warnings while parsing ${filePath}:`, results.errors);
        }
        resolve(results.data);
      },
      error: (error) => {
        console.error(`Error loading ${filePath}:`, error);
        reject(error);
      },
    });
  });
};

/**
 * Load all CSV data files
 * @returns {Promise<Object>} - Promise that resolves to object containing all datasets
 */
export const loadAllData = async () => {
  try {
    const [
      masterDataset,
      testSummary,
      testTypePatterns,
      studentPatterns,
      allComments,
    ] = await Promise.all([
      loadCSV(DATA_FILES.masterDataset),
      loadCSV(DATA_FILES.testSummary),
      loadCSV(DATA_FILES.testTypePatterns),
      loadCSV(DATA_FILES.studentPatterns),
      loadCSV(DATA_FILES.allComments),
    ]);

    return {
      masterDataset,
      testSummary,
      testTypePatterns,
      studentPatterns,
      allComments,
    };
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
};

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file to download
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
