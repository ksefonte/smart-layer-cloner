import { useState, useEffect } from 'react';
import {
  addBase,
  removeBase,
  getAllBaseImages,
  addTemplate,
  getAllTemplatesForBase,
  removeTemplate,
} from '../utils/templates';
import { convertFileSrc } from '@tauri-apps/api/core';
import { confirm } from '@tauri-apps/plugin-dialog';
import './styles/TemplateManager.css';
import FileDropzone from '../components/FileDropzone';

function TemplateManager() {
  const [baseImages, setBaseImages] = useState([]);
  const [selectedBaseImage, setSelectedBaseImage] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templatesForBase, setTemplatesForBase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('bases'); // 'bases', 'addBase', 'templates'
  const [newBaseData, setNewBaseData] = useState({
    name: '',
    filePrefix: '',
    file: null
  });
  const [newTemplateData, setNewTemplateData] = useState({
    name: '',
    fileSuffix: '',
    file: null,
    baseId: ''
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

  function handleAddTemplate() {
    setView('addTemplate')
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
      setError('Please upload a .psd file');
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
    console.log("Base:",base)
    setSelectedBaseImage(base);
    getTemplatesForSelected(base.id)
    console.log(base)
    setView('templates');
  }

  function handleBackToBases() {
    setSelectedBaseImage(null);
    setTemplatesForBase(null)
    setView('bases');
  }
  
  async function handleRemoveBase(base,e) {
    if (e) e.stopPropagation();
    try {
      const confirmation = await confirm(
        'This action cannot be reverted. Are you sure?',
        {
          title: 'Confirm Deletion',
          kind: 'warning',
          okLabel: 'Delete',
          cancelLabel: 'Cancel'
        }
      );
      console.log(confirmation);
      if (!confirmation) {
        return;
      }
      setLoading(true);
      const result = await removeBase(base.id);
      if (result.success) {
        if (selectedBaseImage && selectedBaseImage.id === base.id) {
          setSelectedBaseImage(null);
          setView('bases');
        }
        await fetchBaseImages();
      } else {
        console.log(result)
        setError(result.error || 'Failed to delete base');
      }
    } catch (error) {
      console.error('Error in delete process:', error);
      setError('Failed to delete base: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }
// 

 async function handleRemoveTemplate(template,e) {
    if (e) e.stopPropagation();
    try {
      const confirmation = await confirm(
        'This action cannot be reverted. Are you sure?',
        {
          title: 'Confirm Deletion',
          kind: 'warning',
          okLabel: 'Delete',
          cancelLabel: 'Cancel'
        }
      );
      console.log(confirmation);
      if (!confirmation) {
        return;
      }
      setLoading(true);
      const result = await removeTemplate(template.id);
      if (result.success) {
        if (selectedTemplate && selectedTemplate.id === template.id) {
          setSelectedTemplate(null);
          setView('templates');
        }
        await getTemplatesForSelected(template.baseId);
      } else {
        console.log(result)
        setError(result.error || 'Failed to delete base');
      }
    } catch (error) {
      console.error('Error in delete process:', error);
      setError('Failed to delete base: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitNewTemplate(e) {
    e.preventDefault();
    
    if (!newTemplateData.file) {
      setError('Please upload an image file');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await addTemplate({
        file: newTemplateData.file,
        name: newTemplateData.name,
        fileSuffix: newTemplateData.fileSuffix,
        baseId: selectedBaseImage.id
      });
      
      if (result.success) {
        setNewTemplateData({
          name: '',
          filePrefix: '',
          file: null,
          baseId: selectedBaseImage.id
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

  function handleImageUpload(files) {
    if (!files || files.length === 0) return;
    
    setNewBaseData({
      ...newBaseData,
      file: files[0]
    });
    
    console.log("File selected:", files[0].name);
  }

  function handlePSDUpload(files) {
    if (!files || files.length === 0) return;
    
    setNewTemplateData({
      ...newTemplateData,
      file: files[0]
    });
    
    console.log("File selected:", files[0].name);
  }

  async function getTemplatesForSelected(baseId) {
    setLoading(true);
    try {
      const result = await getAllTemplatesForBase(baseId);
      console.log("Selecting templates...")
      
      if (result.success) {
        setTemplatesForBase(result.selectedTemplates || []);
        console.log(result)
      } else {
        setError(result.error || `Failed to load templates`);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load template records: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
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
          <button onClick={() => setView('templates')} className="back-button">
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
            <small>This prefix will be used when creating output files</small>
          </div>
          
          <div className="form-group">
            <label>Base Image</label>
            <FileDropzone 
              onFilesUploaded={handleImageUpload}
              type="png"
            />
            {newTemplateData.file && (
              <p className="file-selected">
                Selected: {newTemplateData.file.name} ({(newTemplateData.file.size / 1024).toFixed(2)} KB)
              </p>
            )}
            <small>Upload a .PSD file containing a replacable smart layer</small>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={() => setView('bases')} className="cancel-button">
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button" 
              disabled={!newTemplateData.file || loading}
            >
              {loading ? 'Creating...' : 'Create Template'}
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
          <button onClick={handleAddTemplate} className="add-template-button">
            Add New Template
          </button>
        </div>
        
        <div className="templates-list">
          {templatesForBase?.length === 0 ? (
            <p>No templates added for this base image yet.</p>
          ) : (
            templatesForBase?.map(template => (
              <div key={template.id} className="template-card">
                <div className="template-details">
                  <h4>{template.name}</h4>
                  <p className="file-path">{template.templatePath}</p>
                </div>
                <div className="template-actions">
                  <button className="edit-button">Edit</button>
                  <button onClick={() => handleRemoveTemplate(template)}className="delete-button">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </>
    );
  }

  function renderAddTemplateView() {
    return (
      <>
        <div className="view-header">
          <h2>Add New Template</h2>
          <button onClick={() => setView('templates')} className="back-button">
            Cancel
          </button>
        </div>
        
        <form onSubmit={handleSubmitNewTemplate} className="add-template-form">
          <div className="form-group">
            <label htmlFor="name">Template Name</label>
            <input 
              type="text" 
              id="name" 
              value={newTemplateData.name}
              onChange={(e) => setNewTemplateData({...newTemplateData, name: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="fileSuffix">File Suffix (optional)</label>
            <input 
              type="text" 
              id="fileSuffix" 
              value={newTemplateData.fileSuffix}
              onChange={(e) => setNewTemplateData({...newTemplateData, fileSuffix: e.target.value})}
            />
            <small>This suffix will be used when creating output files</small>
          </div>
          
          <div className="form-group">
            <label>Template PSD</label>
            <FileDropzone 
              onFilesUploaded={handlePSDUpload}
              type="psd"
            />
            {newTemplateData.file && (
              <p className="file-selected">
                Selected: {newTemplateData.file.name} ({(newTemplateData.file.size / 1024).toFixed(2)} KB)
              </p>
            )}
            <small>Upload a .PSD with a replcable smart object layer.</small>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={() => setView('bases')} className="cancel-button">
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button" 
              disabled={!newTemplateData.file || loading}
            >
              {loading ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </form>
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
        {view === 'addTemplate' && renderAddTemplateView()}
      </div>
    </div>
  );
}

export default TemplateManager;