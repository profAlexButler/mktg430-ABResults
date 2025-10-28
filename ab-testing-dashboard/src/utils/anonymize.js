/**
 * Student Anonymization Utility
 * Converts student names to anonymous IDs for privacy protection
 * Maintains consistent mapping throughout the application
 */

// Create a consistent mapping from student names to anonymous IDs
const studentIdMap = new Map();
let nextStudentNumber = 1;

/**
 * Convert a student name to an anonymous ID
 * Same name always gets same ID (consistent across the app)
 *
 * @param {string} studentName - Original student name
 * @returns {string} - Anonymous student ID (e.g., "Student 1", "Student 2")
 */
export const anonymizeStudent = (studentName) => {
  if (!studentName || studentName.trim() === '') {
    return 'Anonymous Student';
  }

  // Check if we already have an ID for this student
  if (studentIdMap.has(studentName)) {
    return studentIdMap.get(studentName);
  }

  // Generate a new anonymous ID
  const anonymousId = `Student ${nextStudentNumber}`;
  studentIdMap.set(studentName, anonymousId);
  nextStudentNumber++;

  return anonymousId;
};

/**
 * Anonymize student name in dataset
 * Creates a new object with 'Student Name' field anonymized
 *
 * @param {Object} record - Data record with 'Student Name' field
 * @returns {Object} - Record with anonymized student name
 */
export const anonymizeRecord = (record) => {
  if (!record) return record;

  return {
    ...record,
    'Student Name': anonymizeStudent(record['Student Name']),
  };
};

/**
 * Anonymize an entire dataset
 * @param {Array} dataset - Array of records to anonymize
 * @returns {Array} - Anonymized dataset
 */
export const anonymizeDataset = (dataset) => {
  if (!Array.isArray(dataset)) return dataset;
  return dataset.map(anonymizeRecord);
};

/**
 * Reset the anonymization mapping (for testing purposes)
 */
export const resetAnonymization = () => {
  studentIdMap.clear();
  nextStudentNumber = 1;
};

/**
 * Get the total number of unique students that have been anonymized
 * @returns {number} - Count of unique students
 */
export const getStudentCount = () => {
  return studentIdMap.size;
};
