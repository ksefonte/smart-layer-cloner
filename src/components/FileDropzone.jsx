import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { RxCross2 } from 'react-icons/rx';

function FileDropzone({ onFilesUploaded }, type='all') {
  const [files, setFiles] = useState([]);
  const fileTypes = {
    'all': {
      'image/png': ['.png'],
      'image/psd': ['.psd'],
      'image/photoshop': ['.psd']
    },
    'png': {
      'image/png': ['.png'],
    },
    'psd': {
      'image/psd': ['.psd'],
      'image/photoshop': ['.psd']
    }
  }
  const allowedFileTypes = fileTypes[type] | fileTypes.all

  const onDrop = useCallback(acceptedFiles => {
    setFiles(acceptedFiles);
    if (onFilesUploaded) {
      onFilesUploaded(acceptedFiles);
    }
    console.log(acceptedFiles);
  }, [onFilesUploaded]);

  const { acceptedFiles, getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types/Common_types
    accept: allowedFileTypes
  });

  return (
    <div 
      {...getRootProps()} 
      className={`dropzone ${isDragActive ? 'active' : ''}`}
      style={{
        maxWidth: '80vw',
        minWidth: '80%',
        border: '2px dashed #cccccc',
        borderRadius: '4px',
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragActive ? '#f0f8ff' : '#fafafa',
        marginBottom: '20px',
        transition: 'border .3s ease-in-out, background .3s ease-in-out'
      }}
    >
      <input {...getInputProps()} />
      
      {isDragActive ? (
        <p>Drop the files here...</p>
      ) : (
        <>
          <p>Drag & drop files here, or click to select files</p>
          <em style={{ fontSize: '0.8em', color: '#888' }}>
            (Only .psd and .png files will be accepted)
          </em>
        </>
      )}

      {files.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <h4>Selected Files:</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {files.map((file, index) => (
              <li key={index} style={{
                maxWidth: '80vw',
                minWidth: '80%',
                marginBottom: '5px',
                border: '1px solid #eee',
                padding: '5px',
                borderRadius: '3px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}>
                <span style={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%'
                }}>
                  {file.name}
                </span>
                <span style={{ 
                  fontSize: '0.8em', 
                  color: '#888',
                  marginTop: '3px'
                }}>
                  {(file.size / 1024).toFixed(2)} KB
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default FileDropzone;