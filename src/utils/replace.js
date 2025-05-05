import * as Psd from "ag-psd";
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import 'ag-psd/initialize-canvas.js';

// async function replace({inputPsd, inputPng}) {
async function testReplace() {
    try {
      const dirname = fileURLToPath(new URL('.', import.meta.url));
      const testAssetsPath = join(dirname, '../testAssets');

      //psd
      const psdPath = join(testAssetsPath, '440mL_can_4_Pack.psd');
      const psdBuffer = readFileSync(psdPath);
      const psdArrayBuffer = psdBuffer.buffer.slice(
        psdBuffer.byteOffset,
        psdBuffer.byteOffset + psdBuffer.byteLength
      );
      
      //png
      const pngPath = join(testAssetsPath, 'testPng.png');
      const pngBuffer = readFileSync(pngPath);
      const pngArrayBuffer = pngBuffer.buffer.slice(
        pngBuffer.byteOffset,
        pngBuffer.byteOffset + pngBuffer.byteLength
        );
      const psd = Psd.readPsd(psdArrayBuffer);
      console.log('PSD loaded successfully');
      console.log('Layers found:', getLayerCount(psd));
    return { success: true, psd };
  } catch (error) {
    console.error('Error in smart object replacement test:', error);
    return { success: false, error: error.message };
  }
}

function getLayerCount(psd) {
  let count = 0;
  
  function countLayers(layer) {
    count++;
    
    if (layer.children && layer.children.length > 0) {
      layer.children.forEach(countLayers);
      console.log(layer)
    }
  }
  
  if (psd.children && psd.children.length > 0) {
    psd.children.forEach(countLayers);
  }
  
  return count;
}

testReplace()
  .then(result => {
    if (result.success) {
      console.log('Test completed successfully!');
    } else {
      console.error('Test failed:', result.error);
    }
  });

export default testReplace