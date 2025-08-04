import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Get all disputes
    const { data: disputes, error } = await adminSupabase
      .from('disputes')
      .select('*');
    
    if (error) {
      throw error;
    }

    // Define categories and colors
    const categories = [
      { label: 'Payment Issues', type: 'PAYMENT', color: '#FF8C00' },
      { label: 'Route Deviations', type: 'ROUTE', color: '#4F46E5' },
      { label: 'Service Quality', type: 'SERVICE', color: '#A1A1AA' },
      { label: 'Other', type: 'OTHER', color: '#FACC15' },
    ];

    // Count disputes by type
    const categoryCounts = {
      'PAYMENT': 0,
      'ROUTE': 0,
      'SERVICE': 0,
      'OTHER': 0
    };

    // Process disputes to categorize them
    disputes.forEach(dispute => {
      // Look for keywords in description to categorize if type is missing
      const description = dispute.description?.toLowerCase() || '';
      const type = dispute.type?.toUpperCase() || '';
      
      if (type === 'PAYMENT' || description.includes('payment') || description.includes('money') || description.includes('cost')) {
        categoryCounts['PAYMENT']++;
      } else if (type === 'ROUTE' || description.includes('route') || description.includes('destination') || description.includes('path')) {
        categoryCounts['ROUTE']++;
      } else if (type === 'SERVICE' || description.includes('service') || description.includes('quality') || description.includes('poor')) {
        categoryCounts['SERVICE']++;
      } else {
        categoryCounts['OTHER']++;
      }
    });

    // Format response
    const formattedCategories = categories.map(category => ({
      label: category.label,
      value: categoryCounts[category.type as keyof typeof categoryCounts],
      color: category.color
    }));

    return res.status(200).json({ categories: formattedCategories });
  } catch (error) {
    console.error('Error fetching dispute categories:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
