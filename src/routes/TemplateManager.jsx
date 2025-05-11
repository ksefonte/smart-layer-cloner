import { useState, useEffect } from 'react';
import {
  addBase,
  removeBase,
  getAllBaseImages
} from '../utils/templates';
import { convertFileSrc } from '@tauri-apps/api/core';
import { confirm } from '@tauri-apps/plugin-dialog';
import './styles/TemplateManager.css';
import FileDropzone from '../components/FileDropzone';

function TemplateManager() {
  const [baseImages, setBaseImages] = useState([]);
  const [selectedBaseImage, setSelectedBaseImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('bases'); // 'bases', 'addBase', 'templates'
  const [newBaseData, setNewBaseData] = useState({
    name: '',
    filePrefix: '',
    file: null
  });

  useEffect(() => {
    fetchBaseImages();
  }, []);

  async function fetchBaseImages() {
    setLoading(true);
    try {
      const result = await getAllBaseImages();
      
      if (result.success) {
        setBaseImages(result.baseImages || []);
      } else {
        setError(result.error || 'Failed to load base images');
      }
    } catch (err) {
      console.error('Error fetching base images:', err);
      setError('Failed to load base records: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  function handleAddBaseImage() {
    setView('addBase');
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

  async function handleSubmitNewBase(e) {
    e.preventDefault();
    
    if (!newBaseData.file) {
      setError('Please upload an image file');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await addBase({
        file: newBaseData.file,
        name: newBaseData.name,
        filePrefix: newBaseData.filePrefix
      });
      
      if (result.success) {
        setNewBaseData({
          name: '',
          filePrefix: '',
          file: null
        });

        await fetchBaseImages();
        setView('bases');
      } else {
        setError(result.error || 'Failed to add base image');
      }
    } catch (error) {
      console.error('Error adding base:', error);
      setError(`Failed to add base: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectBase(base) {
    setSelectedBaseImage(base);
    console.log(base)
    setView('templates');
  }

  function handleBackToBases() {
    setSelectedBaseImage(null);
    setView('bases');
  }
  
  async function handleRemoveBase(base,e) {
    if (e) e.stopPropagation();
    const confirmation = await confirm(
      'This action cannot be reverted. Are you sure?',
      { title: 'Tauri', kind: 'warning' }
    );
    console.log(confirmation);
// Prints boolean to the console
    // removeBase(base.id)
  }

  function handleFileUpload(files) {
    if (!files || files.length === 0) return;
    
    setNewBaseData({
      ...newBaseData,
      file: files[0]
    });
    
    console.log("File selected:", files[0].name);
  }

  function getTemplatesForSelected() {
    if (!selectedBaseImage) return [];
    return Object.values(selectedBaseImage.templates || {});
  }

  function renderBasesView() {
    return (
      <>
        <div className="view-header">
          <h2>Bases</h2>
          <button onClick={handleAddBaseImage} className="add-button">
            Add Base Image
          </button>
        </div>
        
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="bases-grid">
            {baseImages.length === 0 ? (
              <p>No base records added yet. Add a base to get started.</p>
            ) : (
              baseImages.map(image => (
                <div 
                  key={image.id} 
                  className="base-card"
                  onClick={() => handleSelectBase(image)}
                >
                  <img 
                    src={getAssetUrl(image?.thumbnailPath)} 
                    alt={image.name} 
                  />
                  <div className="details">
                    <h4>{image.name}</h4>
                    <p>Ratio: {image.aspectRatio?.toFixed(2)}</p>
                    <p>Templates: {Object.keys(image.templates || {}).length}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </>
    );
  }

  function renderAddBaseView() {
    return (
      <>
        <div className="view-header">
          <h2>Add New Base Image</h2>
          <button onClick={() => setView('bases')} className="back-button">
            Cancel
          </button>
        </div>
        
        <form onSubmit={handleSubmitNewBase} className="add-base-form">
          <div className="form-group">
            <label htmlFor="name">Base Name</label>
            <input 
              type="text" 
              id="name" 
              value={newBaseData.name}
              onChange={(e) => setNewBaseData({...newBaseData, name: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="filePrefix">File Prefix (optional)</label>
            <input 
              type="text" 
              id="filePrefix" 
              value={newBaseData.filePrefix}
              onChange={(e) => setNewBaseData({...newBaseData, filePrefix: e.target.value})}
            />
            <small>This prefix will be used when creating template files</small>
          </div>
          
          <div className="form-group">
            <label>Base Image</label>
            <FileDropzone 
              onFilesUploaded={handleFileUpload}
              type="png"
            />
            {newBaseData.file && (
              <p className="file-selected">
                Selected: {newBaseData.file.name} ({(newBaseData.file.size / 1024).toFixed(2)} KB)
              </p>
            )}
            <small>Upload a PNG image to use as the base</small>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={() => setView('bases')} className="cancel-button">
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button" 
              disabled={!newBaseData.file || loading}
            >
              {loading ? 'Creating...' : 'Create Base'}
            </button>
          </div>
        </form>
      </>
    );
  }

  function renderTemplatesView() {
    return (
      <>
        <div className="view-header">
          <h2>
            Templates for {selectedBaseImage?.name}
          </h2>
          <button onClick={() => handleRemoveBase(selectedBaseImage)}>Remove</button>
          <button onClick={handleBackToBases} className="back-button">
            Back to Bases
          </button>
        </div>
        
        <div className="templates-actions">
          <button className="add-template-button">
            Add New Template
          </button>
        </div>
        
        <div className="templates-list">
          {getTemplatesForSelected().length === 0 ? (
            <p>No templates added for this base image yet.</p>
          ) : (
            getTemplatesForSelected().map(template => (
              <div key={template.id} className="template-card">
                <div className="template-details">
                  <h4>{template.name}</h4>
                  <p>Layer count: {template.layerCount}</p>
                  <p className="file-path">{template.filePath}</p>
                </div>
                <div className="template-actions">
                  <button className="edit-button">Edit</button>
                  <button className="delete-button">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </>
    );
  }

  return (
    <div className="template-manager">
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      
      <div className="panel">
        {view === 'bases' && renderBasesView()}
        {view === 'addBase' && renderAddBaseView()}
        {view === 'templates' && renderTemplatesView()}
      </div>
    </div>
  );
}

export default TemplateManager;