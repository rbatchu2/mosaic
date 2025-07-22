import { supabaseService } from '../../../services/supabaseService';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || '00000000-0000-0000-0000-000000000001';
    const accountId = url.searchParams.get('accountId') || undefined;
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // For demo purposes, always use the road trip mock data
    // 50 realistic road trip transactions: SFO → Yosemite → Death Valley → Vegas → Zion → Antelope Canyon → Moab
      const mockTransactions = [
        // March 10 - Day 1: San Francisco departure
        {
          id: 'txn_001',
          description: 'Shell Gas Station - Fuel up for the road',
          amount: -89.45,
          merchantName: 'Shell',
          category: ['Transportation', 'Gas Stations'],
          date: '2024-03-10T08:30:00Z',
          location: { city: 'San Francisco', region: 'CA' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_002',
          description: 'Whole Foods - Road trip snacks and water',
          amount: -127.82,
          merchantName: 'Whole Foods Market',
          category: ['Food and Drink', 'Groceries'],
          date: '2024-03-10T09:15:00Z',
          location: { city: 'San Francisco', region: 'CA' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_003',
          description: 'REI Co-op - Last minute camping gear',
          amount: -234.67,
          merchantName: 'REI Co-op',
          category: ['Shopping', 'Sporting Goods'],
          date: '2024-03-10T10:45:00Z',
          location: { city: 'San Francisco', region: 'CA' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_004',
          description: 'Blue Bottle Coffee - Morning coffee before departure',
          amount: -18.50,
          merchantName: 'Blue Bottle Coffee',
          category: ['Food and Drink', 'Coffee Shops'],
          date: '2024-03-10T11:30:00Z',
          location: { city: 'San Francisco', region: 'CA' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_005',
          description: 'In-N-Out Burger - Lunch in Modesto',
          amount: -32.45,
          merchantName: 'In-N-Out Burger',
          category: ['Food and Drink', 'Fast Food'],
          date: '2024-03-10T14:20:00Z',
          location: { city: 'Modesto', region: 'CA' },
          accountId: 'acc_checking_001'
        },
        
        // March 10-11 - Yosemite
        {
          id: 'txn_006',
          description: 'Yosemite National Park - Entrance fee',
          amount: -35.00,
          merchantName: 'National Park Service',
          category: ['Travel', 'Recreation'],
          date: '2024-03-10T16:45:00Z',
          location: { city: 'Yosemite Valley', region: 'CA' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_007',
          description: 'Ahwahnee Hotel - Dinner at iconic lodge',
          amount: -156.78,
          merchantName: 'Ahwahnee Hotel',
          category: ['Food and Drink', 'Restaurants'],
          date: '2024-03-10T19:30:00Z',
          location: { city: 'Yosemite Valley', region: 'CA' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_008',
          description: 'Curry Village - Camping supplies',
          amount: -45.20,
          merchantName: 'Curry Village Store',
          category: ['Shopping', 'General'],
          date: '2024-03-11T08:15:00Z',
          location: { city: 'Yosemite Valley', region: 'CA' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_009',
          description: 'Degnan\'s Kitchen - Breakfast and coffee',
          amount: -28.90,
          merchantName: 'Degnan\'s Kitchen',
          category: ['Food and Drink', 'Restaurants'],
          date: '2024-03-11T09:00:00Z',
          location: { city: 'Yosemite Valley', region: 'CA' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_010',
          description: 'Yosemite Valley Lodge - Gift shop',
          amount: -67.45,
          merchantName: 'Yosemite Valley Lodge',
          category: ['Shopping', 'Souvenirs'],
          date: '2024-03-11T15:30:00Z',
          location: { city: 'Yosemite Valley', region: 'CA' },
          accountId: 'acc_checking_001'
        },

        // March 11-12 - Death Valley
        {
          id: 'txn_011',
          description: 'Chevron - Gas in Lone Pine',
          amount: -78.90,
          merchantName: 'Chevron',
          category: ['Transportation', 'Gas Stations'],
          date: '2024-03-11T17:45:00Z',
          location: { city: 'Lone Pine', region: 'CA' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_012',
          description: 'Alabama Hills Cafe - Dinner with mountain views',
          amount: -52.30,
          merchantName: 'Alabama Hills Cafe',
          category: ['Food and Drink', 'Restaurants'],
          date: '2024-03-11T19:15:00Z',
          location: { city: 'Lone Pine', region: 'CA' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_013',
          description: 'Death Valley National Park - Entrance fee',
          amount: -30.00,
          merchantName: 'National Park Service',
          category: ['Travel', 'Recreation'],
          date: '2024-03-12T08:30:00Z',
          location: { city: 'Death Valley', region: 'CA' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_014',
          description: 'Furnace Creek Store - Water and snacks',
          amount: -34.56,
          merchantName: 'Furnace Creek General Store',
          category: ['Food and Drink', 'Groceries'],
          date: '2024-03-12T11:20:00Z',
          location: { city: 'Death Valley', region: 'CA' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_015',
          description: 'Badwater Basin - Bottled water emergency',
          amount: -12.00,
          merchantName: 'Death Valley Trading Post',
          category: ['Food and Drink', 'Groceries'],
          date: '2024-03-12T14:45:00Z',
          location: { city: 'Death Valley', region: 'CA' },
          accountId: 'acc_checking_001'
        },

        // March 12-14 - Las Vegas
        {
          id: 'txn_016',
          description: 'Exxon - Gas on way to Vegas',
          amount: -82.15,
          merchantName: 'Exxon',
          category: ['Transportation', 'Gas Stations'],
          date: '2024-03-12T16:30:00Z',
          location: { city: 'Pahrump', region: 'NV' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_017',
          description: 'MGM Grand - Hotel stay',
          amount: -289.00,
          merchantName: 'MGM Grand',
          category: ['Travel', 'Hotels'],
          date: '2024-03-12T20:15:00Z',
          location: { city: 'Las Vegas', region: 'NV' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_018',
          description: 'Gordon Ramsay Hell\'s Kitchen - Celebratory dinner',
          amount: -178.45,
          merchantName: 'Hell\'s Kitchen',
          category: ['Food and Drink', 'Restaurants'],
          date: '2024-03-12T21:30:00Z',
          location: { city: 'Las Vegas', region: 'NV' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_019',
          description: 'Bellagio Casino - Slot machines (oops)',
          amount: -45.00,
          merchantName: 'Bellagio',
          category: ['Entertainment', 'Gaming'],
          date: '2024-03-13T10:20:00Z',
          location: { city: 'Las Vegas', region: 'NV' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_020',
          description: 'Fremont Street Experience - Zip line adventure',
          amount: -89.99,
          merchantName: 'Fremont Street Experience',
          category: ['Entertainment', 'Activities'],
          date: '2024-03-13T14:45:00Z',
          location: { city: 'Las Vegas', region: 'NV' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_021',
          description: 'Hash House A Go Go - Brunch',
          amount: -67.80,
          merchantName: 'Hash House A Go Go',
          category: ['Food and Drink', 'Restaurants'],
          date: '2024-03-13T11:30:00Z',
          location: { city: 'Las Vegas', region: 'NV' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_022',
          description: 'CVS Pharmacy - Sunscreen and aspirin',
          amount: -23.45,
          merchantName: 'CVS Pharmacy',
          category: ['Health', 'Pharmacy'],
          date: '2024-03-13T16:15:00Z',
          location: { city: 'Las Vegas', region: 'NV' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_023',
          description: 'The Buffet at Wynn - All you can eat',
          amount: -124.50,
          merchantName: 'Wynn Las Vegas',
          category: ['Food and Drink', 'Restaurants'],
          date: '2024-03-13T19:00:00Z',
          location: { city: 'Las Vegas', region: 'NV' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_024',
          description: 'Uber - Strip to hotel',
          amount: -18.75,
          merchantName: 'Uber',
          category: ['Transportation', 'Rideshare'],
          date: '2024-03-13T23:30:00Z',
          location: { city: 'Las Vegas', region: 'NV' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_025',
          description: 'Starbucks - Coffee and pastries',
          amount: -21.60,
          merchantName: 'Starbucks',
          category: ['Food and Drink', 'Coffee Shops'],
          date: '2024-03-14T08:45:00Z',
          location: { city: 'Las Vegas', region: 'NV' },
          accountId: 'acc_checking_001'
        },

        // March 14-16 - Zion National Park
        {
          id: 'txn_026',
          description: 'Circle K - Gas and snacks to Zion',
          amount: -76.30,
          merchantName: 'Circle K',
          category: ['Transportation', 'Gas Stations'],
          date: '2024-03-14T12:00:00Z',
          location: { city: 'St. George', region: 'UT' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_027',
          description: 'Zion National Park - Entrance fee',
          amount: -35.00,
          merchantName: 'National Park Service',
          category: ['Travel', 'Recreation'],
          date: '2024-03-14T15:30:00Z',
          location: { city: 'Springdale', region: 'UT' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_028',
          description: 'Cable Mountain Lodge - 2 night stay',
          amount: -398.00,
          merchantName: 'Cable Mountain Lodge',
          category: ['Travel', 'Hotels'],
          date: '2024-03-14T16:45:00Z',
          location: { city: 'Springdale', region: 'UT' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_029',
          description: 'Spotted Dog Cafe - Dinner in Springdale',
          amount: -89.20,
          merchantName: 'Spotted Dog Cafe',
          category: ['Food and Drink', 'Restaurants'],
          date: '2024-03-14T19:15:00Z',
          location: { city: 'Springdale', region: 'UT' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_030',
          description: 'Zion Outfitter - Hiking gear rental',
          amount: -75.00,
          merchantName: 'Zion Outfitter',
          category: ['Recreation', 'Equipment Rental'],
          date: '2024-03-15T08:00:00Z',
          location: { city: 'Springdale', region: 'UT' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_031',
          description: 'Angels Landing Shuttle - Park transportation',
          amount: -15.00,
          merchantName: 'Zion National Park',
          category: ['Transportation', 'Public Transit'],
          date: '2024-03-15T09:30:00Z',
          location: { city: 'Zion National Park', region: 'UT' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_032',
          description: 'Zion Park Gift Shop - Souvenirs and postcards',
          amount: -42.80,
          merchantName: 'Zion National Park Store',
          category: ['Shopping', 'Souvenirs'],
          date: '2024-03-15T16:20:00Z',
          location: { city: 'Zion National Park', region: 'UT' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_033',
          description: 'Cafe Soleil - Breakfast and coffee',
          amount: -34.75,
          merchantName: 'Cafe Soleil',
          category: ['Food and Drink', 'Restaurants'],
          date: '2024-03-16T08:30:00Z',
          location: { city: 'Springdale', region: 'UT' },
          accountId: 'acc_checking_001'
        },

        // March 16-17 - Antelope Canyon area
        {
          id: 'txn_034',
          description: 'Antelope Canyon Tours - Upper canyon tour',
          amount: -186.00,
          merchantName: 'Antelope Canyon Tours',
          category: ['Travel', 'Tours'],
          date: '2024-03-16T14:30:00Z',
          location: { city: 'Page', region: 'AZ' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_035',
          description: 'Maverick - Gas in Page',
          amount: -71.45,
          merchantName: 'Maverick',
          category: ['Transportation', 'Gas Stations'],
          date: '2024-03-16T13:15:00Z',
          location: { city: 'Page', region: 'AZ' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_036',
          description: 'Lake Powell Resort - Hotel with lake view',
          amount: -234.00,
          merchantName: 'Lake Powell Resort',
          category: ['Travel', 'Hotels'],
          date: '2024-03-16T18:00:00Z',
          location: { city: 'Page', region: 'AZ' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_037',
          description: 'Rainbow Room - Dinner with sunset views',
          amount: -98.65,
          merchantName: 'Rainbow Room',
          category: ['Food and Drink', 'Restaurants'],
          date: '2024-03-16T19:45:00Z',
          location: { city: 'Page', region: 'AZ' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_038',
          description: 'Horseshoe Bend - Parking fee',
          amount: -10.00,
          merchantName: 'Glen Canyon Recreation',
          category: ['Travel', 'Parking'],
          date: '2024-03-17T07:30:00Z',
          location: { city: 'Page', region: 'AZ' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_039',
          description: 'Bonkers Restaurant - Hearty breakfast',
          amount: -45.20,
          merchantName: 'Bonkers Restaurant',
          category: ['Food and Drink', 'Restaurants'],
          date: '2024-03-17T09:00:00Z',
          location: { city: 'Page', region: 'AZ' },
          accountId: 'acc_checking_001'
        },

        // March 17-20 - Moab
        {
          id: 'txn_040',
          description: 'Shell - Final gas fill up to Moab',
          amount: -85.70,
          merchantName: 'Shell',
          category: ['Transportation', 'Gas Stations'],
          date: '2024-03-17T12:45:00Z',
          location: { city: 'Blanding', region: 'UT' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_041',
          description: 'Arches National Park - Entrance fee',
          amount: -30.00,
          merchantName: 'National Park Service',
          category: ['Travel', 'Recreation'],
          date: '2024-03-17T16:20:00Z',
          location: { city: 'Moab', region: 'UT' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_042',
          description: 'Red Cliffs Lodge - River view accommodation',
          amount: -567.00,
          merchantName: 'Red Cliffs Lodge',
          category: ['Travel', 'Hotels'],
          date: '2024-03-17T18:30:00Z',
          location: { city: 'Moab', region: 'UT' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_043',
          description: 'Moab Brewery - Local beer and dinner',
          amount: -76.45,
          merchantName: 'Moab Brewery',
          category: ['Food and Drink', 'Restaurants'],
          date: '2024-03-17T20:00:00Z',
          location: { city: 'Moab', region: 'UT' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_044',
          description: 'Canyonlands National Park - Entrance fee',
          amount: -30.00,
          merchantName: 'National Park Service',
          category: ['Travel', 'Recreation'],
          date: '2024-03-18T08:45:00Z',
          location: { city: 'Moab', region: 'UT' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_045',
          description: 'Moab Adventure Center - 4WD jeep tour',
          amount: -145.00,
          merchantName: 'Moab Adventure Center',
          category: ['Travel', 'Tours'],
          date: '2024-03-18T10:30:00Z',
          location: { city: 'Moab', region: 'UT' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_046',
          description: 'City Market - Groceries for final days',
          amount: -67.82,
          merchantName: 'City Market',
          category: ['Food and Drink', 'Groceries'],
          date: '2024-03-18T17:15:00Z',
          location: { city: 'Moab', region: 'UT' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_047',
          description: 'Pasta Jay\'s - Italian dinner',
          amount: -92.30,
          merchantName: 'Pasta Jay\'s',
          category: ['Food and Drink', 'Restaurants'],
          date: '2024-03-18T19:30:00Z',
          location: { city: 'Moab', region: 'UT' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_048',
          description: 'Delicate Arch Hike - Water and snacks',
          amount: -15.60,
          merchantName: 'Arches General Store',
          category: ['Food and Drink', 'Groceries'],
          date: '2024-03-19T08:00:00Z',
          location: { city: 'Moab', region: 'UT' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_049',
          description: 'Moab Information Center - Maps and gifts',
          amount: -28.45,
          merchantName: 'Moab Information Center',
          category: ['Shopping', 'Souvenirs'],
          date: '2024-03-19T15:45:00Z',
          location: { city: 'Moab', region: 'UT' },
          accountId: 'acc_checking_001'
        },
        {
          id: 'txn_050',
          description: 'The Broken Oar - Farewell dinner',
          amount: -134.75,
          merchantName: 'The Broken Oar',
          category: ['Food and Drink', 'Restaurants'],
          date: '2024-03-20T18:30:00Z',
          location: { city: 'Moab', region: 'UT' },
          accountId: 'acc_checking_001'
        }
      ];

      return new Response(JSON.stringify({
        success: true,
        transactions: mockTransactions,
        total: mockTransactions.length
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch transactions'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}