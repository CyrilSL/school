export interface IndianState {
  code: string;
  name: string;
  type: 'state' | 'union_territory';
}

export const INDIAN_STATES: IndianState[] = [
  // States
  { code: 'AP', name: 'Andhra Pradesh', type: 'state' },
  { code: 'AR', name: 'Arunachal Pradesh', type: 'state' },
  { code: 'AS', name: 'Assam', type: 'state' },
  { code: 'BR', name: 'Bihar', type: 'state' },
  { code: 'CG', name: 'Chhattisgarh', type: 'state' },
  { code: 'GA', name: 'Goa', type: 'state' },
  { code: 'GJ', name: 'Gujarat', type: 'state' },
  { code: 'HR', name: 'Haryana', type: 'state' },
  { code: 'HP', name: 'Himachal Pradesh', type: 'state' },
  { code: 'JH', name: 'Jharkhand', type: 'state' },
  { code: 'KA', name: 'Karnataka', type: 'state' },
  { code: 'KL', name: 'Kerala', type: 'state' },
  { code: 'MP', name: 'Madhya Pradesh', type: 'state' },
  { code: 'MH', name: 'Maharashtra', type: 'state' },
  { code: 'MN', name: 'Manipur', type: 'state' },
  { code: 'ML', name: 'Meghalaya', type: 'state' },
  { code: 'MZ', name: 'Mizoram', type: 'state' },
  { code: 'NL', name: 'Nagaland', type: 'state' },
  { code: 'OR', name: 'Odisha', type: 'state' },
  { code: 'PB', name: 'Punjab', type: 'state' },
  { code: 'RJ', name: 'Rajasthan', type: 'state' },
  { code: 'SK', name: 'Sikkim', type: 'state' },
  { code: 'TN', name: 'Tamil Nadu', type: 'state' },
  { code: 'TG', name: 'Telangana', type: 'state' },
  { code: 'TR', name: 'Tripura', type: 'state' },
  { code: 'UP', name: 'Uttar Pradesh', type: 'state' },
  { code: 'UT', name: 'Uttarakhand', type: 'state' },
  { code: 'WB', name: 'West Bengal', type: 'state' },

  // Union Territories
  { code: 'AN', name: 'Andaman and Nicobar Islands', type: 'union_territory' },
  { code: 'CH', name: 'Chandigarh', type: 'union_territory' },
  { code: 'DH', name: 'Dadra and Nagar Haveli and Daman and Diu', type: 'union_territory' },
  { code: 'DL', name: 'Delhi', type: 'union_territory' },
  { code: 'JK', name: 'Jammu and Kashmir', type: 'union_territory' },
  { code: 'LA', name: 'Ladakh', type: 'union_territory' },
  { code: 'LD', name: 'Lakshadweep', type: 'union_territory' },
  { code: 'PY', name: 'Puducherry', type: 'union_territory' },
];

export const getStateByName = (name: string): IndianState | undefined => {
  return INDIAN_STATES.find(state =>
    state.name.toLowerCase() === name.toLowerCase()
  );
};

export const getStateByCode = (code: string): IndianState | undefined => {
  return INDIAN_STATES.find(state =>
    state.code.toLowerCase() === code.toLowerCase()
  );
};

export const getStatesGrouped = () => {
  const states = INDIAN_STATES.filter(item => item.type === 'state');
  const unionTerritories = INDIAN_STATES.filter(item => item.type === 'union_territory');

  return {
    states: states.sort((a, b) => a.name.localeCompare(b.name)),
    unionTerritories: unionTerritories.sort((a, b) => a.name.localeCompare(b.name))
  };
};