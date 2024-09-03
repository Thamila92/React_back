import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './folder.css';

interface Folder {
  id: number;
  name: string;
  type: 'folder';
  documents?: (Folder | Document)[];
  children?: Folder[];
}

interface Document {
  id: number;
  title: string;
  type: 'file';
  createdAt: string;
  description?: string;
  parentFolderId?: number;
}

type Item = Folder | Document;

const FolderExplorer: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [showNewFolderForm, setShowNewFolderForm] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showFileForm, setShowFileForm] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [showDocumentDetails, setShowDocumentDetails] = useState<boolean>(false);
  const navigate = useNavigate();
  const VITE_URL_API = import.meta.env.VITE_URL_API;

  useEffect(() => {
    fetchFolders();
    fetchDocuments();
  }, []);

  function isFolder(item: Item): item is Folder {
    return item.type === 'folder';
  }

  const fetchFolders = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin');
      return;
    }
  
    try {
      const response = await axios.get<Folder[]>(`${VITE_URL_API}/folders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const foldersWithTypes: Folder[] = response.data.map(folder => ({
        ...folder,
        type: 'folder',
        documents: folder.documents?.map(doc => {
          if (isFolder(doc)) {
            return { ...doc, type: 'folder' } as Folder;
          } else {
            return { ...doc, type: 'file' } as Document;
          }
        }),
        children: folder.children?.map(child => ({ ...child, type: 'folder' })) || []
      }));
  
      setFolders(foldersWithTypes);
    } catch (error) {
      toast.error('Erreur lors du chargement des dossiers');
    }
  };

  const fetchDocuments = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin');
      return;
    }
  
    try {
      const response = await axios.get<Document[]>(`${VITE_URL_API}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const rootDocuments = response.data.filter(doc => !doc.parentFolderId);   
      
      const documentsWithTypes: Document[] = rootDocuments.map(doc => ({
        ...doc,
        type: 'file',
      }));
      
      setDocuments(documentsWithTypes);
    } catch (error) {
      toast.error('Erreur lors du chargement des fichiers');
    }
};
const handleFolderClick = async (folder: Folder) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin');
      return;
    }

    // Récupérer le contenu du dossier sélectionné
    const response = await axios.get<Folder>(`${VITE_URL_API}/folder/${folder.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const folderWithTypes: Folder = {
      ...response.data,
      type: 'folder',
      documents: response.data.documents?.map(doc => ({
        ...doc,
        type: 'file',
      })) as Document[],
      children: response.data.children?.map(child => ({
        ...child,
        type: 'folder',
      })) || [],
    };

    setCurrentFolder(folderWithTypes);
    setBreadcrumb((prev) => [...prev, folder]);
  } catch (error) {
    toast.error('Erreur lors de l\'ouverture du dossier');
  }
};



  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumb = breadcrumb.slice(0, index + 1);
    setBreadcrumb(newBreadcrumb);
    setCurrentFolder(newBreadcrumb[index]);
    setSelectedDocument(null);
    setShowDocumentDetails(false);
  };

  const handleBackClick = () => {
    if (breadcrumb.length > 1) {
      breadcrumb.pop();
      const parentFolder = breadcrumb[breadcrumb.length - 1];
      setCurrentFolder(parentFolder);
      setSelectedDocument(null);
      setShowDocumentDetails(false);
    } else {
      setCurrentFolder(null);
      setBreadcrumb([]);
      setSelectedDocument(null);
      setShowDocumentDetails(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin');
      return;
    }

    try {
      const response = await axios.post<Folder>(
        `${VITE_URL_API}/folder`,
        { name: newFolderName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (currentFolder) {
        setCurrentFolder({
          ...currentFolder,
          children: [...(currentFolder.children || []), response.data],
        });
      } else {
        setFolders([...folders, response.data]);
      }
      setNewFolderName('');
      setShowNewFolderForm(false);
      toast.success('Dossier créé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la création du dossier');
    }
  };

  const handleDeleteFolder = async (folderId: number) => {
    try {
      await axios.delete(`${VITE_URL_API}/folder/${folderId}`);
      if (currentFolder) {
        setCurrentFolder({
          ...currentFolder,
          children: currentFolder.children?.filter(child => child.id !== folderId),
        });
      } else {
        setFolders(folders.filter(folder => folder.id !== folderId));
      }
      toast.success('Dossier supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression du dossier');
    }
  };

  const handleRenameFolder = async (folderId: number, newName: string) => {
    try {
      const response = await axios.patch<{ folder: Folder }>(`${VITE_URL_API}/folder/${folderId}`, { name: newName });
      if (currentFolder) {
        setCurrentFolder({
          ...currentFolder,
          children: currentFolder.children?.map(child => 
            child.id === folderId ? response.data.folder : child
          ),
        });
      } else {
        setFolders(folders.map(folder => folder.id === folderId ? response.data.folder : folder));
      }
      toast.success('Dossier renommé avec succès');
    } catch (error) {
      toast.error('Erreur lors du renommage du dossier');
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin');
      return;
    }

    if (!file) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${VITE_URL_API}/document/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setFile(null);
        toast.success("Fichier téléchargé avec succès");
        fetchDocuments();
      }
    } catch (error) {
      toast.error("Erreur lors du téléchargement du fichier");
    }
  };

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowDocumentDetails(true);
  };

  const handleDragStart = (e: React.DragEvent, item: Item) => {
    e.dataTransfer.setData('item', JSON.stringify(item));
  };

  const handleDrop = async (e: React.DragEvent, targetFolder: Folder) => {
    e.preventDefault();
    
    try {
      const itemData = e.dataTransfer.getData('item');
      const item = JSON.parse(itemData) as Item;

      if (isFolder(item)) {
        const response = await axios.post(`${VITE_URL_API}/folders/${targetFolder.id}/add-folder/${item.id}`);
        toast.success('Dossier déplacé avec succès');
      } else {
        const response = await axios.post(`${VITE_URL_API}/folders/${targetFolder.id}/add-file`, { fileId: item.id });
        toast.success('Fichier déplacé avec succès');
        setDocuments(prevDocuments => prevDocuments.filter(doc => doc.id !== item.id));
      }
      
      handleFolderClick(targetFolder);
    } catch (error) {
      toast.error('Erreur lors du déplacement de l\'élément');
    }
  };

  const renderItems = (items: Item[]) => {
    return items.map((item) => (
      <div 
        key={item.id} 
        className="item" 
        draggable 
        onDragStart={(e) => handleDragStart(e, item)}
        onDrop={(e) => handleDrop(e, item as Folder)} 
        onDragOver={(e) => e.preventDefault()}
        onClick={() => {
          if (isFolder(item)) {
            handleFolderClick(item);  // Ouvre le dossier
          }
        }}
      >
        <div className="item-info">
          <span>
            {item.type === 'folder' ? '📁' : '📄'} 
            {isFolder(item) ? item.name : item.title}
          </span>
        </div>
  
        {isFolder(item) ? (
          <div className="item-actions">
            <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(item.id); }}>Supprimer</button>
            <button onClick={(e) => { e.stopPropagation(); handleRenameFolder(item.id, prompt('Nouveau nom :') || item.name); }}>Renommer</button>
          </div>
        ) : (
          <div className="item-actions">
            <button onClick={(e) => { e.stopPropagation(); handleViewDocument(item); }}>Voir Plus</button>
          </div>
        )}
      </div>
    ));
  };
  


  const renderDocumentDetails = () => {
    if (!selectedDocument || !showDocumentDetails) return null;
  
    return (
      <div className="document-details-container">
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
            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {selectedDocument.title}
              </td>
              <td className="px-6 py-4">
                {new Date(selectedDocument.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                {selectedDocument.description || "No description provided"}
              </td>
              <td className="px-6 py-4">
                <button className="btn btn-primary" onClick={() => handleDownloadDocument(selectedDocument.id)}>Download</button>
                <button className="btn btn-danger" style={{ marginLeft: '10px' }} onClick={() => handleDeleteDocument(selectedDocument.id)}>Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };
  

  const handleDeleteDocument = async (fileId: number) => {
    try {
      await axios.delete(`${VITE_URL_API}/document/${fileId}`);
      toast.success('Fichier supprimé avec succès');
      fetchDocuments();
      if (currentFolder) {
        handleFolderClick(currentFolder);
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression du fichier');
    }
  };

  const handleDownloadDocument = async (fileId: number) => {
    try {
      const response = await axios.get(`${VITE_URL_API}/document/${fileId}/download`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', response.headers['content-disposition'].split('filename=')[1]);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Fichier téléchargé avec succès');
    } catch (error) {
      toast.error('Erreur lors du téléchargement du fichier');
    }
  };

  return (
    <div className="folder-explorer">
      <div className="path-navigation">
        <button onClick={handleBackClick} disabled={!currentFolder}>Retour</button>
        <span>
          {breadcrumb.map((folder, index) => (
            <span key={folder.id} onClick={() => handleBreadcrumbClick(index)}>
              {index > 0 && ' -> '}
              {folder.name}
            </span>
          ))}
          {!currentFolder && 'Racine'}
        </span>
      </div>

      <div className="folder-actions">
        <button onClick={() => setShowNewFolderForm(!showNewFolderForm)}>
          {showNewFolderForm ? 'Annuler' : 'Nouveau Dossier'}
        </button>
        <button onClick={() => setShowFileForm(!showFileForm)}>
          {showFileForm ? 'Annuler' : 'Ajouter un fichier'}
        </button>
        {showNewFolderForm && (
          <form onSubmit={handleCreateFolder}>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nom du nouveau dossier"
              required
            />
            <button type="submit">Créer</button>
          </form>
        )}
        {showFileForm && (
          <form onSubmit={handleFileUpload}>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
            <button type="submit">Télécharger</button>
          </form>
        )}
      </div>

      <div className="folder-contents">
        {currentFolder?.documents && currentFolder.documents.length === 0 && currentFolder.children?.length === 0 && (
          <p style={{ color: 'gray' }}>Vide</p>
        )}

        {currentFolder ? (
          <>
            {renderItems(currentFolder.documents ?? [])}
            {renderItems(currentFolder.children ?? [])}
          </>
        ) : (
          <>
            {renderItems(folders)}
            {renderItems(documents)}
          </>
        )}
      </div>

      {renderDocumentDetails()}
    </div>
  );
};

export default FolderExplorer;
