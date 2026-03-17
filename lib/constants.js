// Pellet types matching the database CHECK constraint
// To add more, also ALTER the listings table constraint in Supabase
export const PELLET_TYPES = [
  'Rice Husk',
  'Wood',
  'Mustard Husk',
  'Cotton Stalk',
  'Bagasse',
  'Groundnut Shell',
  'Sawdust',
  'Coconut Shell',
  'Soybean Husk',
  'Coffee Husk',
  'Other',
];

// All Indian states and UTs
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

// Order status options
export const ORDER_STATUSES = [
  'pending',
  'accepted',
  'loaded',
  'in_transit',
  'delivered',
  'disputed',
  'cancelled',
];

// Order status labels for display
export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  accepted: 'Accepted',
  loaded: 'Loaded',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  disputed: 'Disputed',
  cancelled: 'Cancelled',
};
