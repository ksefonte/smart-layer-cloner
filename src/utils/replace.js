import * as Psd from "ag-psd";
import { basename, join, appDataDir } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/core';
import { mkdir, writeFile, remove, exists, readFile } from '@tauri-apps/plugin-fs';
import 'ag-psd/initialize-canvas.js';

// async function replace({inputPsd, inputPng}) {
export async function testReplace() {
    try {
      const replaceLayerName = 'REPLACE_LAYER';
      const appDir = await appDataDir();
      const testAssetsPath = await join(appDir, 'testAssets');
      console.log("TR: All assets:",testAssetsPath)

      //psd
      const psdPath = await join(testAssetsPath, '440mL_can_4_Pack.psd');
      console.log("TR: PSD",psdPath)
      await exists(psdPath)
      const psdBuffer = await readFile(psdPath)
      console.log("TR: Buffer",psdBuffer)
      const psdArrayBuffer = psdBuffer.buffer.slice(
        psdBuffer.byteOffset,
        psdBuffer.byteOffset + psdBuffer.byteLength
      );
      
      //png
      const pngPath = await join(testAssetsPath, 'testPng.png');
      console.log("TR: PNG Path",pngPath)
      const pngBuffer = await readFile(pngPath);
      const pngArrayBuffer = pngBuffer.buffer.slice(
        pngBuffer.byteOffset,
        pngBuffer.byteOffset + pngBuffer.byteLength
        );
      const pngUint8Array = pngArrayBuffer instanceof ArrayBuffer ? new Uint8Array(pngArrayBuffer) : pngArrayBuffer;
      

      const psd = Psd.readPsd(psdArrayBuffer);
      console.log('PSD loaded successfully');
      console.log('Layers found:', getLayerCount(psd));
      if (psd.linkedFiles.length === 0) {
        console.log("No linked layers found")
        return
      }
      // pseudocode
      const replacedLayers = replaceSmartLayer(
        {
          psd,
          png: pngUint8Array,
          replacementLayer: null,
          outputPath: testAssetsPath
        }
      )
    return { success: true, psd };
  } catch (error) {
    console.error('Error in smart object replacement test:', error);
    return { success: false, error: error.message };
  }
}

  function getAssetUrl(filePath) {
    if (!filePath) return '';
    try {
      console.log("converted filesrc",convertFileSrc(filePath))
      return convertFileSrc(filePath);
    } catch (error) {
      console.error('Error converting file path to URL:', error);
      return '';
    }
  }

function getLayerCount(psd) {
  let count = 0;
  console.log(psd)
  
  function countLayers(layer) {
    count++;
    
    if (layer.children && layer.children.length > 0) {
      layer.children.forEach(countLayers);
    }
  }
  
  if (psd.children && psd.children.length > 0) {
    psd.children.forEach(countLayers);
  }
  
  return count;
}

async function replaceSmartLayer({psd,png,replacementLayer=null,outputPath}) {
  if (psd?.linkedFiles?.length === 0) {
    console.log("No linked layers found")
    return
  }
  else {
    try {
      let replacedFiles = [];
      let replacedLayerCount = 0
      console.log("PSD:",psd)
      psd.linkedFiles.forEach(linkedFile => {
        console.log("Replacing:")
        console.log(linkedFile.data)
        console.log("with")
        console.log(png)
        linkedFile.data = png
      })
      console.log("PSD Replaced:",psd)
      console.log("Writing modified layer to new psd")
      const modifiedPsd = Psd.writePsd(psd)
      console.log("Generating output file path")
      const modifiedOutputPath = await join(outputPath,`testOutput.png`)
      console.log("Generating new buffer")
      const outputBuffer = new Uint8Array(modifiedPsd)
      console.log("Writing file to:",modifiedOutputPath)
      console.log("PSD: Updated PSD:",modifiedPsd)
      await writeFile(modifiedOutputPath,modifiedPsd)
      replacedLayerCount ++
      console.log("Successfully wrote file")
      return { success:true, replacedFiles}
    } catch (error) {
      console.log('Error replacing smart layer', error)
      return { success:false, error: error.message };
    }
  }
}

// testReplace()
//   .then(result => {
//     if (result.success) {
//       console.log('Test completed successfully!');
//     } else {
//       console.error('Test failed:', result.error);
//     }
//   });

export default testReplace