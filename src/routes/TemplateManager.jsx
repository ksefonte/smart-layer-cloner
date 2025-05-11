import { useState, useEffect } from 'react';
import { addBase } from '../utils/templates';
import './styles/TemplateManager.css';
import FileDropzone from '../components/FileDropzone';

function TemplateManager() {
  // State definitions
  const [baseImages, setBaseImages] = useState([]);
  const [selectedBaseImage, setSelectedBaseImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('bases'); // 'bases', 'addBase', 'templates'
  const [newBaseData, setNewBaseData] = useState({
    name: '',
    filePrefix: ''
  });

  // Fetch base records on component mount
  useEffect(() => {
    // Mock function to fetch base records
    // This would be replaced with actual API call to backend
    const fetchBaseImages = async () => {
      try {
        // TODO: Implement backend API call
        // For now, just mock empty data and set loading to false
        setBaseImages([]);
        setLoading(false);
      } catch (err) {
        setError('Failed to load base records');
        setLoading(false);
      }
    };

    fetchBaseImages();
  }, []);

  // Function to handle adding a new base image
  async function handleAddBaseImage() {
    setView('addBase');
  }

  // Function to handle form submission for new base
  async function handleSubmitNewBase(e) {
    e.preventDefault();
    
    try {
      // TODO: Implement backend call to save new base
      // addBase(newBaseData) would be the actual function call
      
      console.log("Submitting new base:", newBaseData);
      
      // Reset form and go back to bases view
      setNewBaseData({
        name: '',
        filePrefix: ''
      });
      setView('bases');
      
      // Refresh base records
      // This would be replaced with actual API call
      setLoading(true);
      // fetchBaseImages();
      setLoading(false);
      
    } catch (error) {
      setError('Failed to add new base image');
    }
  }

  // Function to handle selecting a base image
  function handleSelectBase(base) {
    setSelectedBaseImage(base);
    setView('templates');
  }

  // Function to handle going back to bases view
  function handleBackToBases() {
    setSelectedBaseImage(null);
    setView('bases');
  }

  // Function to handle file upload for base image
  function handleFileUpload(files) {
    // This would extract height, width, aspect ratio from the file
    console.log("Files uploaded:", files);
    
    // For now, just update the form with the filename
    if (files && files.length > 0) {
      setNewBaseData({
        ...newBaseData,
        thumbnailPath: files[0].path, // This would be handled by the backend
        // These would be extracted from the image file
        height: 0,
        width: 0,
        aspectRatio: 0
      });
    }
  }

  // Function to get templates for selected base
  // This would be replaced with actual data from backend
  function getTemplatesForSelected() {
    if (!selectedBaseImage) return [];
    return selectedBaseImage.templates || [];
  }

  // Render function for bases view
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
                    src={image.thumbnailPath} 
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

  // Render function for add base form
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
            <small>Upload a PNG image to use as the base</small>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={() => setView('bases')} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Create Base
            </button>
          </div>
        </form>
      </>
    );
  }

  // Render function for templates view
  function renderTemplatesView() {
    return (
      <>
        <div className="view-header">
          <h2>
            Templates for {selectedBaseImage?.name}
          </h2>
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
      {/* Error message display */}
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