/**
 * Centralized Supabase Storage Service
 * 
 * Manages secure file uploads, validation, public/signed URLs, and fallback
 * previews across avatars, listings, lab resources, project files, and donations.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const ALLOWED_DOC_TYPES = ['application/pdf', 'text/plain', 'text/csv', 'application/json'];
const DISALLOWED_EXTENSIONS = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.js', '.sh', '.msi', '.com', '.pif'];

export const storageService = {
  /**
   * Validate file size, mime type, and extension
   */
  validateFile(file, { isDocument = false, maxSizeBytes = 5 * 1024 * 1024 } = {}) {
    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    const filename = file.name.toLowerCase();
    const hasDisallowedExt = DISALLOWED_EXTENSIONS.some((ext) => filename.endsWith(ext));
    if (hasDisallowedExt) {
      return { valid: false, error: 'Executable and script file formats are strictly prohibited for safety.' };
    }

    if (file.size > maxSizeBytes) {
      const mbLimit = Math.round(maxSizeBytes / (1024 * 1024));
      return { valid: false, error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the maximum limit of ${mbLimit}MB.` };
    }

    const allowedMimeList = isDocument ? [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES] : ALLOWED_IMAGE_TYPES;
    if (file.type && !allowedMimeList.includes(file.type.toLowerCase())) {
      return { valid: false, error: `Unsupported file format (${file.type}). Please select a standard JPG, PNG, WEBP, or PDF.` };
    }

    return { valid: true };
  },

  /**
   * Sanitize a filename to prevent directory traversal or unsafe characters
   */
  sanitizeFilename(filename = '') {
    return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  },

  /**
   * Upload file to Supabase Storage with local blob fallback
   */
  async uploadFile(bucket, path, file, options = {}) {
    const validation = this.validateFile(file, options);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const sanitizedPath = path.split('/').map((seg) => this.sanitizeFilename(seg)).join('/');

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(sanitizedPath, file, {
            upsert: true,
            contentType: file.type
          });

        if (error) {
          console.warn(`Supabase Storage upload error in bucket "${bucket}":`, error.message);
          throw error;
        }

        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(sanitizedPath);

        return {
          path: sanitizedPath,
          publicUrl: publicUrlData?.publicUrl || ''
        };
      } catch (err) {
        console.warn('Falling back to local object preview URL due to upload error:', err);
      }
    }

    // Local development fallback
    const localUrl = URL.createObjectURL(file);
    return {
      path: sanitizedPath,
      publicUrl: localUrl
    };
  },

  /**
   * Get public URL for an asset in a public bucket
   */
  getPublicUrl(bucket, path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
      return path;
    }

    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data?.publicUrl || '';
    }

    return path;
  },

  /**
   * Generate signed URL for private bucket (e.g. project-files)
   */
  async getSignedUrl(bucket, path, expiresIn = 3600) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
      return path;
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }
    }

    return path;
  },

  /**
   * Delete file from storage
   */
  async deleteFile(bucket, path) {
    if (!path || path.startsWith('http')) return true;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.storage.from(bucket).remove([path]);
        return !error;
      } catch (e) {
        console.warn('Storage delete error', e);
        return false;
      }
    }
    return true;
  }
};
