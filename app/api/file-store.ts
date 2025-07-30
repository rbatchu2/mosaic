// Global store that persists across API calls
// Using globalThis to ensure it persists in Expo environment
declare global {
  var __GROUPS_STORE__: any[] | undefined;
}

// Initialize global store
if (!globalThis.__GROUPS_STORE__) {
  globalThis.__GROUPS_STORE__ = undefined;
}

// Default groups
const DEFAULT_GROUPS = [
  {
    id: 'group_001',
    name: 'Foodie Friends',
    description: 'Regular dining group for restaurants and food experiences',
    category: 'dining',
    color: '#EF4444',
    memberCount: 3,
    user_id: '1',
    created_at: '2024-06-01T10:00:00Z',
    balance: 127.45,
    totalSpent: 2847.80,
    savings: 1250
  },
  {
    id: 'group_002',
    name: 'Commute Crew',
    description: 'Transportation sharing for daily commutes',
    category: 'transport',
    color: '#3B82F6',
    memberCount: 2,
    user_id: '1',
    created_at: '2024-06-02T15:30:00Z',
    balance: -85.60,
    totalSpent: 1892.45,
    savings: 2400
  },
  {
    id: 'group_003',
    name: 'House Mates',
    description: 'Household expenses and utilities',
    category: 'household',
    color: '#10B981',
    memberCount: 4,
    user_id: '1',
    created_at: '2024-06-03T09:15:00Z',
    balance: 156.30,
    totalSpent: 1876.50,
    savings: 1100
  },
  {
    id: 'group_004',
    name: 'Weekend Warriors',
    description: 'Entertainment and social activities',
    category: 'entertainment',
    color: '#8B5CF6',
    memberCount: 5,
    user_id: '1',
    created_at: '2024-06-04T18:45:00Z',
    balance: 234.75,
    totalSpent: 1634.90,
    savings: 890
  },
  {
    id: 'group_005',
    name: 'Road Trip Crew',
    description: 'Epic SFO to Moab adventure - sharing all travel, lodging, and activity costs',
    category: 'travel',
    color: '#F59E0B',
    memberCount: 4,
    user_id: '1',
    created_at: '2024-03-08T12:00:00Z',
    balance: -43.20,
    totalSpent: 956.30,
    savings: 675
  }
];

// Initialize store with defaults if empty
const initializeStore = (): any[] => {
  if (!globalThis.__GROUPS_STORE__ || globalThis.__GROUPS_STORE__.length === 0) {
    console.log('🗄️ Global Store: Initializing with default groups');
    globalThis.__GROUPS_STORE__ = [...DEFAULT_GROUPS];
  }
  return globalThis.__GROUPS_STORE__;
};

// Read groups from store
export const readGroups = async (): Promise<any[]> => {
  const groups = initializeStore();
  console.log('🗄️ Global Store: Read', groups.length, 'groups from global memory');
  return groups;
};

// Write groups to store
export const writeGroups = async (groups: any[]): Promise<void> => {
  globalThis.__GROUPS_STORE__ = [...groups];
  console.log('🗄️ Global Store: Wrote', groups.length, 'groups to global memory');
};

// Add a group
export const addGroup = async (group: any): Promise<void> => {
  try {
    const groups = await readGroups();
    groups.push(group);
    await writeGroups(groups);
    console.log('🗄️ Global Store: Added group:', group.name, '| Total groups:', groups.length);
  } catch (error) {
    console.error('🗄️ Global Store: Error adding group:', error);
    throw error;
  }
};

// Get all groups
export const getGroups = async (): Promise<any[]> => {
  return await readGroups();
}; 