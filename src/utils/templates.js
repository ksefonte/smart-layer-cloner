import { Store, load } from '@tauri-apps/plugin-store';
import { nanoid } from 'nanoid';
import { basename, join, appDataDir } from '@tauri-apps/api/path';
import { mkdir, writeFile } from '@tauri-apps/plugin-fs';

export async function addBaseImage(path, fileBuffer, name = '') {
  try {
    console.log("Adding base image")
    const store = await load('templates-config.json', { autoSave: false });
    const id = nanoid();
    const dimensions = await getImageDimensionsFromArrayBuffer(fileBuffer);
    const aspectRatio = dimensions.width / dimensions.height;
    const displayName = name || await basename(path);
    const appDir = await appDataDir();
    const thumbnailsDir = await join(appDir, 'thumbnails');
    try {
      await mkdir(thumbnailsDir, { recursive: true });
    } catch (error) {
      console.log('Thumbnails directory already exists or error:', error);
    }
    const thumbnailPath = await join(thumbnailsDir, `${id}.png`);
    console.log("Path is:")
    console.log(thumbnailPath)
    await writeFile(thumbnailPath, fileBuffer);

    const baseImage = {
      id,
      name: displayName,
      path,
      thumbnailPath,
      aspectRatio,
      templates: {}
    };
    
    console.log("Attempting to update store")
    await store.set(`baseImages.${id}`, baseImage);
    await store.save();
    
    return { success: true, id, baseImage };
  } catch (error) {
    console.error('Error adding base image:', error);
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

export async function addTemplate(baseImageId, templateInfo) {
  try {
    const baseImage = await store.get(`baseImages.${baseImageId}`);
    if (!baseImage) {
      throw new Error('Base image not found');
    }
    
    const templateId = nanoid();
    
    const template = {
      id: templateId,
      name: templateInfo.name,
      description: templateInfo.description || '',
      psdPath: templateInfo.psdPath,
      enabled: templateInfo.enabled !== false
    };
    baseImage.templates[templateId] = template;
    await store.set(`baseImages.${baseImageId}`, baseImage);
    await store.save();
    
    return { success: true, templateId, template };
  } catch (error) {
    console.error('Error adding template:', error);
    return { success: false, error: error.message };
  }
}

export async function getAllBaseImages() {
  try {
    const store = await load('templates-config.json', { autoSave: false });
    const baseImages = await store.get('baseImages') || {};
    return { success: true, baseImages: Object.values(baseImages) };
  } catch (error) {
    console.error('Error getting base images:', error);
    return { success: false, error: error.message, baseImages: [] };
  }
}

export async function findBaseImageByAspectRatio(targetRatio, tolerance = 0.05) {
  try {
    const result = await getAllBaseImages();
    if (!result.success) {
      throw new Error(result.error);
    }
    
    const matches = result.baseImages.filter(image => {
      const diff = Math.abs(image.aspectRatio - targetRatio);
      return diff <= tolerance;
    });
    
    matches.sort((a, b) => {
      const diffA = Math.abs(a.aspectRatio - targetRatio);
      const diffB = Math.abs(b.aspectRatio - targetRatio);
      return diffA - diffB;
    });
    
    return { success: true, matches };
  } catch (error) {
    console.error('Error finding image by aspect ratio:', error);
    return { success: false, error: error.message, matches: [] };
  }
}

export async function getTemplatesForBaseImage(baseImageId) {
  try {
    const baseImage = await store.get(`baseImages.${baseImageId}`);
    if (!baseImage) {
      throw new Error('Base image not found');
    }
    
    return { 
      success: true, 
      templates: Object.values(baseImage.templates),
      baseImage
    };
  } catch (error) {
    console.error('Error getting templates:', error);
    return { success: false, error: error.message, templates: [] };
  }
}

export async function updateTemplate(baseImageId, templateId, updates) {
  try {
    const baseImage = await store.get(`baseImages.${baseImageId}`);
    if (!baseImage) {
      throw new Error('Base image not found');
    }
    
    if (!baseImage.templates[templateId]) {
      throw new Error('Template not found');
    }
    
    baseImage.templates[templateId] = {
      ...baseImage.templates[templateId],
      ...updates
    };
    
    await store.set(`baseImages.${baseImageId}`, baseImage);
    await store.save();
    
    return { success: true, template: baseImage.templates[templateId] };
  } catch (error) {
    console.error('Error updating template:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteTemplate(baseImageId, templateId) {
  try {
    const baseImage = await store.get(`baseImages.${baseImageId}`);
    if (!baseImage) {
      throw new Error('Base image not found');
    }
    
    if (!baseImage.templates[templateId]) {
      throw new Error('Template not found');
    }
    
    delete baseImage.templates[templateId];
    
    await store.set(`baseImages.${baseImageId}`, baseImage);
    await store.save();
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting template:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteBaseImage(baseImageId) {
  try {
    const baseImages = await store.get('baseImages') || {};
    if (!baseImages[baseImageId]) {
      throw new Error('Base image not found');
    }
    
    delete baseImages[baseImageId];
    
    await store.set('baseImages', baseImages);
    await store.save();
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting base image:', error);
    return { success: false, error: error.message };
  }
}