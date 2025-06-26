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

    // Vérifier que l'URL est bien une URL Supabase publique
    if (!fileUrl.includes('/storage/v1/object/public/')) {
      console.error('URL non valide - pas une URL publique Supabase:', fileUrl);
      return res.status(400).json({ message: 'Invalid file URL provided. Not a valid Supabase public URL.' });
    }

    // Parser l'URL Supabase
    const urlParts = fileUrl.split('/storage/v1/object/public/');
    if (urlParts.length < 2) {
        console.error('Impossible de parser l\'URL Supabase:', fileUrl);
        return res.status(400).json({ message: 'Invalid file URL provided. Not a valid Supabase public URL.' });
    }

    const [bucketName, ...pathParts] = urlParts[1].split('/');
    const filePath = pathParts.join('/');

    if (!bucketName || !filePath) {
        console.error('Bucket ou chemin manquant:', { fileUrl, bucketName, filePath });
        return res.status(400).json({ message: 'Could not determine file path from URL.' });
    }

    console.log('Tentative de téléchargement depuis Supabase Storage:', { bucketName, filePath });

    // Essayer d'abord avec l'URL publique directe
    try {
      const response = await fetch(fileUrl);
      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());
        
        // Définir les headers pour forcer le téléchargement
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', buffer.length);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

        console.log(`Fichier téléchargé avec succès via URL publique: "${fileName}" (${buffer.length} bytes)`);
        return res.status(200).send(buffer);
      }
    } catch (fetchError) {
      console.log('Échec du téléchargement direct, tentative via SDK Supabase...', { error: fetchError });
    }

    // Si l'URL publique ne fonctionne pas, essayer avec le SDK Supabase
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      console.error('Erreur Supabase Storage:', error);
      return res.status(404).json({ message: `File not found or access denied. Supabase error: ${error.message}` });
    }

    if (data) {
      const buffer = Buffer.from(await data.arrayBuffer());

      // Définir les headers pour forcer le téléchargement
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

      console.log(`Fichier téléchargé avec succès via SDK: "${fileName}" (${buffer.length} bytes)`);
      return res.status(200).send(buffer);
    }
    
    return res.status(404).json({ message: 'File not found.' });

  } catch (error) {
    console.error('Unexpected error in download-file handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return res.status(500).json({ message: 'Server error during file download.', error: errorMessage });
  }
}
