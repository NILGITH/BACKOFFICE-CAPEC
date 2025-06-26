
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Add CORS headers to allow downloading from email clients
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { fileUrl, fileName } = req.query;

    if (typeof fileUrl !== 'string' || typeof fileName !== 'string') {
      return res.status(400).json({ message: 'fileUrl and fileName are required query parameters.' });
    }

    console.log('Download request received:', { fileUrl, fileName });

    // The fileUrl should be a Supabase public URL
    // e.g., https://<project-ref>.supabase.co/storage/v1/object/public/<bucket-name>/<file-path>
    const urlParts = fileUrl.split('/storage/v1/object/public/');
    if (urlParts.length < 2) {
        console.error('Invalid Supabase file URL:', fileUrl);
        return res.status(400).json({ message: 'Invalid file URL provided. Not a valid Supabase public URL.' });
    }

    const [bucketName, ...pathParts] = urlParts[1].split('/');
    const filePath = pathParts.join('/');

    if (!bucketName || !filePath) {
        console.error('Could not parse bucket and path from URL:', { fileUrl, bucketName, filePath });
        return res.status(400).json({ message: 'Could not determine file path from URL.' });
    }

    console.log('Attempting to download from Supabase Storage:', { bucketName, filePath });

    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      console.error('Supabase Storage download error:', error);
      return res.status(404).json({ message: `File not found or access denied. Supabase error: ${error.message}` });
    }

    if (data) {
      const buffer = Buffer.from(await data.arrayBuffer());

      // Set headers to force download
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

      console.log(`Successfully sending file "${fileName}" (${buffer.length} bytes)`);
      return res.status(200).send(buffer);
    }
    
    // This case should ideally not be reached if there's no error and no data
    return res.status(404).json({ message: 'File not found.' });

  } catch (error) {
    console.error('Unexpected error in download-file handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return res.status(500).json({ message: 'Server error during file download.', error: errorMessage });
  }
}
