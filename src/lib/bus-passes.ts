
export type BusPass = {
  passCode: string;
  holderName: string;
  passType: 'General' | 'Route';
  category: 'Student' | 'Citizen';
  validFrom: string; // ISO String
  validTo: string; // ISO String
  validBusTypes: ('City Ordinary' | 'Metro Express')[];
  route?: {
    from: string;
    to: string;
  };
};

export const busPasses: BusPass[] = [
  // Student - General - Active (Male)
  {
    passCode: 'TK45678392',
    holderName: 'Ravi Babu',
    category: 'Student',
    passType: 'General',
    validFrom: '2024-04-01T00:00:00.000Z',
    validTo: '2026-03-31T23:59:59.999Z', // Active
    validBusTypes: ['City Ordinary', 'Metro Express'],
  },
  // Student - Route - Active (Female)
  {
    passCode: 'TK98765432',
    holderName: 'Priya Sharma',
    category: 'Student',
    passType: 'Route',
    validFrom: '2024-06-15T00:00:00.000Z',
    validTo: '2029-06-14T23:59:59.999Z', // Active
    validBusTypes: ['City Ordinary', 'Metro Express'],
    route: {
      from: 'Kukatpally',
      to: 'Hitech City',
    },
  },
  // Citizen - General - Expired (Male)
  {
    passCode: 'TK99887766',
    holderName: 'Sanjay Singh',
    category: 'Citizen',
    passType: 'General',
    validFrom: '2023-05-01T00:00:00.000Z',
    validTo: '2024-04-30T23:59:59.999Z', // Expired
    validBusTypes: ['City Ordinary', 'Metro Express'],
  },
  // Citizen - Route - Active (Female)
  {
    passCode: 'TK12312312',
    holderName: 'Meena Kumari',
    category: 'Citizen',
    passType: 'Route',
    validFrom: '2024-01-01T00:00:00.000Z',
    validTo: '2028-12-31T23:59:59.999Z', // Active
    validBusTypes: ['City Ordinary', 'Metro Express'],
    route: {
      from: 'Secunderabad',
      to: 'Ameerpet',
    },
  },
  // Student - General - Active (Female)
  {
    passCode: 'TK11223344',
    holderName: 'Aisha Khan',
    category: 'Student',
    passType: 'General',
    validFrom: '2023-07-01T00:00:00.000Z',
    validTo: '2025-06-30T23:59:59.999Z',
    validBusTypes: ['City Ordinary', 'Metro Express'],
  },
  // Student - General - Active (Male)
  {
    passCode: 'TK55667788',
    holderName: 'Vikram Patel',
    category: 'Student',
    passType: 'General',
    validFrom: '2023-08-01T00:00:00.000Z',
    validTo: '2025-01-31T23:59:59.999Z',
    validBusTypes: ['City Ordinary', 'Metro Express'],
  },
  // Citizen - Route - Active (Female)
  {
    passCode: 'TK13579246',
    holderName: 'Sunita Rao',
    category: 'Citizen',
    passType: 'Route',
    validFrom: '2023-07-20T00:00:00.000Z',
    validTo: '2025-07-19T23:59:59.999Z',
    validBusTypes: ['City Ordinary', 'Metro Express'],
    route: {
      from: 'Dilsukhnagar',
      to: 'Koti',
    },
  },
  // Citizen - General - Active (Male)
  {
    passCode: 'TK24681357',
    holderName: 'Anil Reddy',
    category: 'Citizen',
    passType: 'General',
    validFrom: '2024-01-01T00:00:00.000Z',
    validTo: '2026-12-31T23:59:59.999Z', // Active
    validBusTypes: ['City Ordinary', 'Metro Express'],
  },
  // Student - Route - Active (Male)
  {
    passCode: 'TK00998877',
    holderName: 'Kumar Verma',
    category: 'Student',
    passType: 'Route',
    validFrom: '2023-06-01T00:00:00.000Z',
    validTo: '2028-05-31T23:59:59.999Z', // Active
    validBusTypes: ['City Ordinary', 'Metro Express'],
    route: {
      from: 'Charminar',
      to: 'Nampally'
    }
  },
];
