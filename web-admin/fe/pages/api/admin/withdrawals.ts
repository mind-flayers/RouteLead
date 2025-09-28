import type { NextApiRequest, NextApiResponse } from 'next';
import { ensureAdmin } from '../../../lib/serverAuth';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await ensureAdmin(req, res))) return;

  const { method } = req;
  const { withdrawalId } = req.query;

  try {
    let url = `${BACKEND_BASE_URL}/api/withdrawals`;
    
    if (withdrawalId) {
      url += `/${withdrawalId}`;
    } else if (method === 'GET') {
      url += '/admin/all';
    }

    // Add query parameters for PATCH requests
    if (method === 'PATCH' && req.query.status) {
      const params = new URLSearchParams();
      params.append('status', req.query.status as string);
      if (req.query.transactionId) {
        params.append('transactionId', req.query.transactionId as string);
      }
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error proxying withdrawal request:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Internal server error' 
    });
  }
}
