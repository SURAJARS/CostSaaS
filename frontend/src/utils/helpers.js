// Date formatting utilities
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-IN');
};

// Number formatting utilities
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

// Quantity formatting utility
export const formatQuantity = (quantity, unit) => {
  if (!unit) return `${quantity}`;
  
  quantity = parseFloat(quantity);
  
  // Convert grams to kg if >= 1000
  if (unit === 'gm' && quantity >= 1000) {
    return `${(quantity / 1000).toFixed(2)}Kg`;
  }
  
  // Convert ml to liters if >= 1000
  if (unit === 'ml' && quantity >= 1000) {
    return `${(quantity / 1000).toFixed(2)}L`;
  }
  
  return `${quantity.toFixed(2)}${unit}`;
};

// File download utilities
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentElement.removeChild(link);
};

// Local storage utilities
export const setLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getLocalStorage = (key) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

// Validation utilities
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhoneNumber = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone);
};
