/**
 * Utility function to calculate total amount for items
 * Total Amount = Base Amount - Discount
 *
 * @param {number} baseAmount - The base price of the item
 * @param {number} discount - The discount amount (default: 0)
 * @returns {number} The calculated total amount
 */
const calculateTotal = (baseAmount, discount = 0) => {
  if (typeof baseAmount !== 'number' || baseAmount < 0) {
    throw new Error('Base amount must be a non-negative number')
  }

  if (typeof discount !== 'number' || discount < 0) {
    throw new Error('Discount must be a non-negative number')
  }

  if (discount > baseAmount) {
    throw new Error('Discount cannot be greater than base amount')
  }

  return Number((baseAmount - discount).toFixed(2))
}

/**
 * Utility function to validate tax values
 * @param {boolean} taxApplicability - Whether tax is applicable
 * @param {number} tax - Tax value
 * @param {string} taxType - Type of tax (percentage/fixed)
 * @returns {boolean} Validation result
 */
const validateTax = (taxApplicability, tax, taxType) => {
  if (!taxApplicability) {
    return true // No validation needed if tax is not applicable
  }

  if (typeof tax !== 'number' || tax < 0) {
    return false
  }

  if (taxType === 'percentage' && tax > 100) {
    return false
  }

  return true
}

/**
 * Utility function to format error responses
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {object} Formatted error object
 */
const createError = (message, statusCode = 400) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

module.exports = {
  calculateTotal,
  validateTax,
  createError
}
