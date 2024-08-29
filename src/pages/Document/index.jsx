import "./home.css";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { toast } from "react-toastify";
import getdate from "../../utils/getDate.js";
 
import FolderManager from "../Folder/index.tsx"
const Document = () => {
  const text = "Companion";
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const [file, setFile] = useState("");
  const [today, setToday] = useState("");
  const [documents, setDocuments] = useState([]);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [editMode, setEditMode] = useState(null);  
  const [editableTitle, setEditableTitle] = useState("");
  const [editableDescription, setEditableDescription] = useState("");
  const VITE_URL_API = import.meta.env.VITE_URL_API;

  const fetchDocuments = async () => {
    let token = localStorage.getItem('token');
    if (!token) {
        navigate("/admin");
        return;
    }
    
    try {
      const response = await axios.get(`${VITE_URL_API}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      setDocuments(response.data);
    } catch (error) {
      console.error('Erreur lors de la requête :', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    let token = localStorage.getItem('token');
    if (!token) {
        navigate("/admin");
        return;
    }

    let timeout;
    if (index < text.length) {
      timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(index));
        setIndex(index + 1);
      }, 300); 
    } else {
      timeout = setTimeout(() => {
        setDisplayedText('');
        setIndex(0);
      }, 3000); 
    }

    return () => clearTimeout(timeout); 
  }, [index, text, navigate]);

  useEffect(() => {
    setToday(getdate());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted!");

    let token = localStorage.getItem('token');
    if (!token) {
        console.log("No token found. Redirecting to /admin...");
        navigate("/admin");
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    console.log("File added to FormData:", file);

    try {
        console.log("Sending POST request to upload the file...");
        const response = await axios.post(`${VITE_URL_API}/document/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
            },
        });

        console.log("Response from the server:", response);

        if (response.status === 200) {
            console.log("File uploaded successfully!");
            setFile("");
            toast.success("Envoyé");
            fetchDocuments();
            setTimeout(() => {
                navigate("/admin/Document");
            }, 3000);
        } else {
            console.log("File upload failed with status:", response.status);
        }
    } catch (error) {
        console.error("Error response during file upload:", error);
        toast.error('An unknown error occurred');
    }
};


  const handleView = async (fileId) => {
    let token = localStorage.getItem('token');
    if (!token) {
      navigate("/admin");
      return;
    }
  
    try {
      console.log("Fetching document with fileId:", fileId); // Log de débogage
      const response = await axios.get(`${VITE_URL_API}/document/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      console.log("API response:", response); // Log de débogage
  
      if (response.data && response.data.links && response.data.links.webViewLink) {
        setSelectedDocumentUrl(response.data.links.webViewLink);
        setDownloadUrl(response.data.links.webContentLink);
      } else {
        console.error("No links found in the API response.");
        setSelectedDocumentUrl("");
        setDownloadUrl("");
      }
    } catch (error) {
      console.error("Error fetching document:", error); // Log de débogage
      setSelectedDocumentUrl("");
      setDownloadUrl("");
    }
  };
  

  // Fonction pour entrer en mode édition
  const handleEdit = (doc) => {
    setEditMode(doc.id);
    setEditableTitle(doc.title);
    setEditableDescription(doc.description);
  };

  // Fonction pour sauvegarder les modifications (via PATCH)
  const handleSave = async (docId) => {
    let token = localStorage.getItem('token');
    if (!token) {
      navigate("/admin");
      return;
    }

    try {
      // Utiliser PATCH pour la mise à jour partielle du document
      const response = await axios.patch(`${VITE_URL_API}/document/${docId}`, {
        title: editableTitle,
        description: editableDescription
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.status === 200) {
        toast.success("Document updated successfully");
        setEditMode(null);
        fetchDocuments(); // Actualiser la liste des documents
      }
    } catch (error) {
      toast.error("Failed to update document");
    }
  };

  // Fonction pour annuler l'édition
  const handleCancel = () => {
    setEditMode(null);
  };

  // Fonction pour supprimer un document
  const handleDelete = async (docId) => {
    let token = localStorage.getItem('token');
    if (!token) {
      navigate("/admin");
      return;
    }

    try {
      const response = await axios.delete(`${VITE_URL_API}/document/${docId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.status === 200) {
        toast.success("Document deleted successfully");
        fetchDocuments(); // Actualiser la liste des documents
      }
    } catch (error) {
      toast.error("Failed to delete document");
    }
  };

  return (
    <div className="home-content">
      <div className="today">
        <p className="today-text">{today}</p>
      </div>
      <div style={{margin:"35px"}}>
        <div style={{borderColor:'orange', borderWidth:'2px', borderStyle: 'solid', width:'50%', borderRadius:'8px', padding:'10px'}}>
          <form onSubmit={handleSubmit}>
            <label htmlFor="file"><b>Upload :</b></label>
            <input
              id="file"
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              aria-label="Enter file"
              type="file"
              name="file"
              placeholder="Enter file"
              onChange={(e) => {
                setFile(e.target.files[0]);
              }}
              required
              style={{marginRight: '10px' }}
            />
            <br />
            <div style={{borderColor:'orange', borderWidth:'2px', borderRadius:'3px',textAlign:'center',color:'white',backgroundColor:'orange'}}>
              <input
                type="submit"
                aria-label="Se connecter"
                value="ENVOYER"
              />
            </div>
          </form>
        </div>
        <br />
        <div>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Files</th>
                  <th scope="col" className="px-6 py-3">Upload date</th>
                  <th scope="col" className="px-6 py-3">Description</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {editMode === doc.id ? (
                        <input
                          type="text"
                          value={editableTitle}
                          onChange={(e) => setEditableTitle(e.target.value)}
                        />
                      ) : (
                        <span onClick={() => handleEdit(doc)}>{doc.title}</span>
                      )}
                    </th>
                    <td className="px-6 py-4">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {editMode === doc.id ? (
                        <input
                          type="text"
                          value={editableDescription}
                          onChange={(e) => setEditableDescription(e.target.value)}
                        />
                      ) : (
                        <span onClick={() => handleEdit(doc)}>{doc.description}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editMode === doc.id ? (
                        <>
                          <button onClick={() => handleSave(doc.id)}>Save</button>
                          <button onClick={handleCancel} style={{ marginLeft: '10px' }}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-primary" onClick={() => handleView(doc.id)}>View</button>
                          <button className="btn btn-secondary" style={{ marginLeft: '10px' }} onClick={() => window.open(downloadUrl, '_blank')}>Download</button>
                          <button className="btn btn-danger" style={{ marginLeft: '10px' }} onClick={() => handleDelete(doc.id)}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div>
        <h2>Documents</h2>
     
        <FolderManager />
      </div>
          </div>

          {selectedDocumentUrl && (
            <div style={{ marginTop: '20px' }}>
              <iframe
                src={selectedDocumentUrl}
                width="100%"
                height="500px"
                title="Document Viewer"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Document;
