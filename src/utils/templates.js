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

export async function addBase(path, name = '', filePrefix = '') {
  try {
    console.log("Adding base record");
    const db = await getDb();
    const id = nanoid();
    const dimensions = await getImageDimensionsFromArrayBuffer(fileBuffer);
    const { width, height } = dimensions;
    const aspectRatio = width / height;
    const displayName = name || await basename(path);
    
    const appDir = await appDataDir();
    const thumbnailsDir = await join(appDir, 'thumbnails');
    try {
      await mkdir(thumbnailsDir, { recursive: true });
    } catch (error) {
      console.log('Thumbnails directory already exists or error:', error);
    }
    
    const thumbnailPath = await join(thumbnailsDir, `${id}.png`);
    console.log("Path is:");
    console.log(thumbnailPath);
    await writeFile(thumbnailPath, fileBuffer);
    
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
      templatesArray: []
    };
    
    return { success: true, id, baseImage };
  } catch (error) {
    console.error('Error adding base record:', error);
    return { success: false, error: error.message };
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