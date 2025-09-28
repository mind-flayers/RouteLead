import type { NextApiRequest, NextApiResponse } from 'next';
import { ensureAdmin } from '../../../../../lib/serverAuth';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await ensureAdmin(req, res))) return;

  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id } = req.query;
  const { status, transactionId } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Withdrawal ID is required' 
    });
  }

  if (!status || typeof status !== 'string') {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Status is required' 
    });
  }

  try {
    const params = new URLSearchParams();
    params.append('status', status);
    if (transactionId && typeof transactionId === 'string') {
      params.append('transactionId', transactionId);
    }

    const url = `${BACKEND_BASE_URL}/api/withdrawals/${id}/status?${params.toString()}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error updating withdrawal status:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Internal server error' 
    });
  }
}
