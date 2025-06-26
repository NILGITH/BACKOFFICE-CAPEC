
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { fileUrl, fileName } = req.query;

    if (!fileUrl || !fileName) {
      return res.status(400).json({ message: 'URL du fichier et nom requis' });
    }

    console.log('Téléchargement demandé:', { fileUrl, fileName });

    // Pour les fichiers mock, on simule le téléchargement
    if (typeof fileUrl === 'string' && fileUrl.includes('mock-storage.capec-ci.com')) {
      const mockContent = `Contenu simulé du fichier: ${fileName}
Date de création: ${new Date().toISOString()}
Type: Fichier de test CAPEC
Application: Système de gestion de contenu CAPEC
URL de production: https://backoffice.capec-ci.org
      
Ceci est un fichier de démonstration généré automatiquement.
Soumis via l'application CAPEC pour mise à jour du site capec-ci.org

Détails techniques:
- Fichier généré automatiquement
- Système de téléchargement fonctionnel
- Intégration avec Supabase Storage
- Compatible avec l'URL de production

Ce fichier peut être téléchargé depuis les emails de notification.`;

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', Buffer.byteLength(mockContent));
      
      return res.status(200).send(mockContent);
    }

    // Pour les fichiers Supabase Storage
    if (typeof fileUrl === 'string' && fileUrl.includes('supabase')) {
      try {
        // Extraire le chemin du fichier depuis l'URL Supabase
        const urlParts = fileUrl.split('/storage/v1/object/public/');
        if (urlParts.length > 1) {
          const [bucket, ...pathParts] = urlParts[1].split('/');
          const filePath = pathParts.join('/');
          
          console.log('Tentative de téléchargement Supabase:', { bucket, filePath });
          
          // Télécharger le fichier depuis Supabase Storage
          const { data, error } = await supabase.storage
            .from(bucket)
            .download(filePath);

          if (error) {
            console.error('Erreur Supabase Storage:', error);
            return res.status(404).json({ message: 'Fichier non trouvé dans le stockage' });
          }

          if (data) {
            const buffer = await data.arrayBuffer();
            
            res.setHeader('Content-Type', data.type || 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Length', buffer.byteLength);
            
            return res.status(200).send(Buffer.from(buffer));
          }
        }
      } catch (supabaseError) {
        console.error('Erreur lors du téléchargement Supabase:', supabaseError);
      }
    }

    // Pour les URLs HTTP externes (y compris les URLs publiques Supabase)
    if (typeof fileUrl === 'string' && fileUrl.startsWith('http')) {
      try {
        console.log('Tentative de téléchargement HTTP:', fileUrl);
        
        const response = await fetch(fileUrl);
        
        if (!response.ok) {
          console.error('Réponse HTTP non OK:', response.status, response.statusText);
          return res.status(404).json({ message: 'Fichier non accessible' });
        }

        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        
        console.log('Téléchargement HTTP réussi:', { 
          size: buffer.byteLength, 
          contentType,
          fileName 
        });
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', buffer.byteLength);
        
        return res.status(200).send(Buffer.from(buffer));
      } catch (fetchError) {
        console.error('Erreur lors du téléchargement HTTP:', fetchError);
        return res.status(500).json({ message: 'Erreur lors du téléchargement du fichier' });
      }
    }

    // Redirection simple pour les autres cas
    if (typeof fileUrl === 'string') {
      console.log('Redirection vers:', fileUrl);
      return res.redirect(302, fileUrl);
    }

    return res.status(404).json({ message: 'Fichier non trouvé' });

  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    return res.status(500).json({ 
      message: 'Erreur serveur lors du téléchargement',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}
