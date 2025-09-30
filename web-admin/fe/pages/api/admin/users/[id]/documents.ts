
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = 'verification-documents';
const DOCUMENT_TYPES = [
  'PROFILE_PHOTO',
  'FACE_PHOTO',
  'NATIONAL_ID',
  'DRIVERS_LICENSE',
  'VEHICLE_REGISTRATION',
  'INSURANCE',
  'VEHICLE_FRONT_VIEW',
  'VEHICLE_BACK_VIEW',
  'VEHICLE_INSIDE_VIEW',
  'VEHICLE_LICENSE',
  'OWNER_NIC_FRONT',
  'OWNER_NIC_BACK',
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid user ID.' });
  }
  try {
    // Gather all document URLs
    const documents: any[] = [];
    for (const type of DOCUMENT_TYPES) {
      const { data: files, error } = await supabase
        .storage
        .from(BUCKET)
        .list(`documents/${id}/${type}`);
      if (error || !files) continue;
      for (const file of files) {
        if (file.name.startsWith('.')) continue;
        documents.push({
          documentType: type,
          name: file.name,
          documentUrl: supabase.storage.from(BUCKET).getPublicUrl(`documents/${id}/${type}/${file.name}`).data.publicUrl,
        });
      }
    }

    // Fetch user profile for extra info
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    res.status(200).json({
      documents,
      nicNumber: profile?.nic_number || '',
      licenceNumber: profile?.driver_license_number || '',
      licenceExpiry: profile?.license_expiry_date || '',
      facePhoto: documents.find(d => d.documentType === 'FACE_PHOTO')?.documentUrl || '',
      vehicleMake: profile?.vehicle_make || '',
      vehicleModel: profile?.vehicle_model || '',
      vehiclePlateNumber: profile?.vehicle_plate_number || '',
      vehiclePhotos: documents.filter(d => ['VEHICLE_FRONT_VIEW','VEHICLE_BACK_VIEW','VEHICLE_INSIDE_VIEW'].includes(d.documentType)).map(d => d.documentUrl),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch documents.' });
  }
}
