import api from './api';

/**
 * Performs an arithmetic calculation via the backend API.
 * @param {string} operation - Operation name: 'sum', 'difference', 'multiply', 'divide'
 * @param {number|string} num1 - First operand
 * @param {number|string} num2 - Second operand
 * @returns {Promise} Axios response with the calculation result
 */
export const calculate = (operation, num1, num2) => {
  const cleanN1 = encodeURIComponent(num1);
  const cleanN2 = encodeURIComponent(num2);
  return api.get(`calculate/${operation}/${cleanN1}/${cleanN2}/`);
};
