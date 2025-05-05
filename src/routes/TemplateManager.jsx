import { useState, useEffect } from 'react';
import FileDropzone from '../components/FileDropZone';
// You'll implement these functions yourself
import { 
  getAllBaseImages, 
  addBaseImage, 
  deleteBaseImage,
  addTemplate,
  updateTemplate,
  deleteTemplate
} from '../utils/templates';
import './styles/TemplateManager.css'

function TemplateManager() {
  // State definitions
  const [baseImages, setBaseImages] = useState([]);
  const [selectedBaseImage, setSelectedBaseImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    psdPath: '',
    enabled: true
  });

  useEffect(() => {
    loadBaseImages();
  }, []);

  async function loadBaseImages() {
    try {
      setLoading(true);
      const result = await getAllBaseImages();
      if (result.success) {
        setBaseImages(result.baseImages);
        if (!selectedBaseImage && result.baseImages.length > 0) {
          setSelectedBaseImage(result.baseImages[0]);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  async function handleAddBaseImage() {
    try {
      console.log("Handle button clicked")
    } catch (error) {
      console.log("Click failed")
    }
  }
  async function handleDroppedBaseImage(files) {
    console.log("Dropped base image...")
    console.log(files)
    if (files && files.length > 0) {
      try {
        const fileBuffer = await files[0].arrayBuffer();
        const result = await addBaseImage(files[0].path, fileBuffer);
        if (result.success) {
          await loadBaseImages();
          setSelectedBaseImage(result.baseImage);
        } else {
          setError(result.error);
        }
      } catch (error) {
        console.error("Error loading file as ArrayBuffer", error);
        setError("Failed to load the file: " + error.message);
      }
    }
  }

  function getTemplatesForSelected() {
    if (!selectedBaseImage) return [];
    return Object.values(selectedBaseImage.templates || {});
  }
  return (
    <div className="template-manager">
      <h2>Template Manager</h2>
      
      {/* Error message display */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      
      <div className="manager-layout">
        {/* Base Images Panel */}
        <div className="base-images-panel">
          <h3>Base Images</h3>
          
          {/* Add base image button */}
          <div className="actions">
            <button onClick={handleAddBaseImage}>Add Base Image</button>
          </div>
          
          {/* Base image dropzone */}
          <FileDropzone 
            onFilesUploaded={handleDroppedBaseImage}
            fileType="png"
            label="Drop PNG base image here"
          />
          
          {/* Base images list */}
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="base-images-list">
              {baseImages.length === 0 ? (
                <p>No base images added yet. Add a base image to get started.</p>
              ) : (
                baseImages.map(image => (
                  <div 
                    key={image.id} 
                    className={`base-image-item ${selectedBaseImage?.id === image.id ? 'selected' : ''}`}
                    onClick={() => setSelectedBaseImage(image)}
                  >
                    <img 
                      src={convertFileSrc(image.thumbnailPath)} 
                      alt={image.name} 
                    />
                    <div className="details">
                      <h4>{image.name}</h4>
                      <p>Ratio: {image.aspectRatio.toFixed(2)}</p>
                      <p>Templates: {Object.keys(image.templates || {}).length}</p>
                    </div>
                    <button 
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBaseImage(image.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
        {/* Templates Panel */}
        <div className="templates-panel">
          <h3>
            {selectedBaseImage 
              ? `Templates for ${selectedBaseImage.name}` 
              : 'Select a Base Image to Manage Templates'}
          </h3>
          
          {/* Only show template controls if a base image is selected */}
          {selectedBaseImage && (
            <>
              {/* Add template button */}
              <div className="actions">
                <button 
                  onClick={() => setIsAddingTemplate(true)}
                  disabled={!selectedBaseImage}
                >
                  Add New Template
                </button>
              </div>
              
              {/* Template dropzone */}
              {/* <FileDropzone 
                onFilesUploaded={handleDroppedPsdFile}
                fileType="psd"
                label="Drop PSD template here"
                disabled={!selectedBaseImage}
              /> */}
              
              {/* Add template form */}
              {isAddingTemplate && (
                <div className="add-template-form">
                  {/* Template form fields */}
                </div>
              )}
              
              {/* Templates list */}
              <div className="templates-list">
                {getTemplatesForSelected().length === 0 ? (
                  <p>No templates added for this base image yet.</p>
                ) : (
                  getTemplatesForSelected().map(template => (
                    <div key={template.id} className="template-card">
                      {/* Template card content */}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TemplateManager;