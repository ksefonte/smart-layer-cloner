import { nanoid } from 'nanoid';
import { basename, join, appDataDir } from '@tauri-apps/api/path';
import { mkdir, writeFile } from '@tauri-apps/plugin-fs';
import Database from '@tauri-apps/plugin-sql';

let db = null;
async function getDb() {
  if (!db) {
    db = await Database.load('sqlite:test.db');
  }
  return db;
}
export async function removeBase(baseId) {
  try {
    const db = await getDb();
    await db.execute(
      `DELETE FROM base_images WHERE id = $1`,[baseId]
    );
    return {success: true};
  } catch (error) { 
    return { success: false, error: error.message };
  }
}


export async function addBase(baseData) {
  try {
    console.log("Adding base record");
    const { file, name = '', filePrefix = '' } = baseData;
    
    let fileBuffer;
    if (file instanceof Blob || file instanceof File) {
      fileBuffer = await file.arrayBuffer();
    } else if (baseData.fileBuffer) {
      fileBuffer = baseData.fileBuffer;
    } else {
      throw new Error('No valid file or file buffer provided');
    }

    const id = nanoid();
    
    const dimensions = await getImageDimensionsFromArrayBuffer(fileBuffer);
    const { width, height } = dimensions;
    const aspectRatio = width / height;
    
    const displayName = name || (file.name ? file.name : 'Unnamed Base');
    
    const appDir = await appDataDir();
    const thumbnailsDir = await join(appDir, 'thumbnails');
    try {
      await mkdir(thumbnailsDir, { recursive: true });
    } catch (error) {
      console.log('Thumbnails directory already exists or error:', error);
    }
    
    const thumbnailPath = await join(thumbnailsDir, `${id}.png`);
    console.log("Saving thumbnail to:", thumbnailPath);
    await writeFile(thumbnailPath, fileBuffer);
    
    const db = await getDb();
    
    await db.execute(
      `INSERT INTO base_images (id, name, aspect_ratio, height, width, thumbnail_path, file_prefix) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, displayName, aspectRatio, height, width, thumbnailPath, filePrefix || '']
    );
    
    const baseImage = {
      id,
      name: displayName,
      aspectRatio,
      height,
      width,
      thumbnailPath,
      filePrefix: filePrefix || '',
      templates: {}
    };
    
    return { success: true, baseImage };
  } catch (error) {
    console.error('Error adding base record:', error);
    return { success: false, error: error.message };
  }
}

export async function getAllBaseImages() {
  try {
    const db = await getDb();
    const result = await db.select('SELECT * FROM base_images');
    
    return { 
      success: true, 
      baseImages: result.map(row => ({
        id: row.id,
        name: row.name,
        aspectRatio: row.aspect_ratio,
        height: row.height,
        width: row.width,
        thumbnailPath: row.thumbnail_path,
        filePrefix: row.file_prefix,
        templates: {}
      }))
    };
  } catch (error) {
    console.error('Error fetching base images:', error);
    return { success: false, error: error.message, baseImages: [] };
  }
}

async function getImageDimensionsFromArrayBuffer(arrayBuffer) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([arrayBuffer]);
    const objectUrl = URL.createObjectURL(blob);
    
    const img = new Image();
    img.onload = () => {
      resolve({ 
        width: img.width, 
        height: img.height 
      });
      URL.revokeObjectURL(objectUrl);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image from array buffer'));
    };
    img.src = objectUrl;
  });
}