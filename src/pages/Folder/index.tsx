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
  parentFolder?: {
    id: number;
    name: string;
  };
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
  const [downloadUrl, setDownloadUrl] = useState("");

  const [editMode, setEditMode] = useState<boolean>(false);
  const [editableTitle, setEditableTitle] = useState<string>('');
  const [editableDescription, setEditableDescription] = useState<string>('');

  const VITE_URL_API = import.meta.env.VITE_URL_API;

  useEffect(() => {
    fetchFolders();
    fetchDocuments();
  }, []);

  function isFolder(item: Item): item is Folder {
    return item.type === 'folder';
  }

  const handleDoubleClick = () => {
    if (selectedDocument) {
      setEditableTitle(selectedDocument.title);
      setEditableDescription(selectedDocument.description || '');
      setEditMode(true);
    }
  };

  const handleSave = async (docId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/admin");
      return;
    }

    try {
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
        setEditMode(false);
        fetchDocuments(); // Actualiser la liste des documents
      }
    } catch (error) {
      toast.error("Failed to update document");
    }
  };

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
        documents: folder.documents?.map(doc => ({
          ...doc,
          type: 'file'
        })) as Document[],
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
      const response = await axios.get(`${VITE_URL_API}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const rootDocuments: Document[] = response.data
        .filter((doc: any) => !doc.folder)  // Filtrer les documents sans dossier parent
        .map((doc: any) => ({
          ...doc,
          type: 'file' as const,  // Assigner explicitement le type "file"
        }));
  
      setDocuments(rootDocuments);
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
      setBreadcrumb(prev => [...prev, folder]);
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

  const handleBackClick = async () => {
    if (breadcrumb.length > 1) {
      breadcrumb.pop();
      const parentFolder = breadcrumb[breadcrumb.length - 1];
      setCurrentFolder(parentFolder);
      setSelectedDocument(null);
      setShowDocumentDetails(false);
      handleFolderClick(parentFolder);  // Recharger les éléments du dossier parent
    } else {
      setCurrentFolder(null);
      setBreadcrumb([]);
      setSelectedDocument(null);
      setShowDocumentDetails(false);
      await fetchFolders();  // Recharger les éléments racine
      await fetchDocuments();  // Recharger les documents racine
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
        setFolders(prev => [...prev, response.data]);
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

  const handleRemoveFromParent = async (folderId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/admin");
      return;
    }

    try {
      const folderResponse = await axios.get<Folder>(`${VITE_URL_API}/folder/${folderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const folder = folderResponse.data;

      if (!folder.parentFolder) {
        toast.error("Le dossier n'a pas de parent à retirer.");
        return;
      }

      const removeResponse = await axios.post(`${VITE_URL_API}/folders/${folderId}/remove-from-parent`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (removeResponse.status === 200) {
        toast.success("Dossier retiré du parent avec succès");

        const parentFolderResponse = await axios.get<Folder>(`${VITE_URL_API}/folder/${folder.parentFolder.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const parentFolder = parentFolderResponse.data;
        const grandParentFolderId = parentFolder.parentFolder?.id;

        if (grandParentFolderId) {
          const addToGrandParentResponse = await axios.post(`${VITE_URL_API}/folders/${grandParentFolderId}/add-folder/${folderId}`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (addToGrandParentResponse.status === 200) {
            toast.success("Dossier déplacé sous le grand-parent avec succès");
          } else {
            toast.error("Erreur lors du déplacement du dossier sous le grand-parent");
          }
        }
      } else {
        toast.error("Erreur lors du retrait du dossier du parent");
      }

      fetchFolders();
      if (currentFolder && currentFolder.id === folderId) {
        setCurrentFolder(null);
        setBreadcrumb([]);
      } else if (currentFolder) {
        handleFolderClick(currentFolder);
      }
    } catch (error) {
      console.error('Erreur lors du retrait du dossier du parent:', error);
      toast.error('Erreur lors du retrait du dossier du parent');
    }
  };

  const handleRemoveFileFromFolder = async (fileId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/admin');
        return;
      }

      const documentResponse = await axios.get(`${VITE_URL_API}/document/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const document = documentResponse.data.document;
      const currentFolderId = document.folder?.id;

      if (!currentFolderId) {
        toast.error('Le document n\'est pas dans un dossier.');
        return;
      }

      const folderResponse = await axios.get(`${VITE_URL_API}/folder/${currentFolderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const currentFolder = folderResponse.data;
      const parentFolderId = currentFolder.parentFolder?.id;

      await axios.post(`${VITE_URL_API}/files/${fileId}/remove-from-folder`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Fichier retiré du dossier avec succès');

      if (parentFolderId) {
        await axios.post(`${VITE_URL_API}/folders/${parentFolderId}/add-file`, { fileId }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        toast.success('Fichier déplacé dans le dossier parent avec succès');
      }

      if (currentFolder) {
        handleFolderClick(currentFolder);
      } else {
        fetchDocuments();
      }
    } catch (error) {
      console.error('Erreur lors du retrait ou du déplacement du fichier :', error);
      toast.error('Erreur lors du retrait ou du déplacement du fichier');
    }
  };

  const renderItems = (items: Item[]) => {
    return items.map((item) => (
      <div
        key={(isFolder(item) ? 'folder-' : 'file-') + item.id}
        className="item"
        draggable
        onDragStart={(e) => handleDragStart(e, item)}
        onDrop={(e) => handleDrop(e, item as Folder)}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => {
          if (isFolder(item)) {
            handleFolderClick(item);
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
            {currentFolder && (
              <button onClick={(e) => { e.stopPropagation(); handleRemoveFromParent(item.id); }}>Retirer du parent</button>
            )}
          </div>
        ) : (
          <div className="item-actions">
            <button onClick={(e) => { e.stopPropagation(); handleViewDocument(item); }}>Voir Plus</button>
            {currentFolder && (
              <button onClick={(e) => { e.stopPropagation(); handleRemoveFileFromFolder(item.id); }}>Retirer du dossier</button>
            )}
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
                {editMode ? (
                  <input
                    type="text"
                    value={editableTitle}
                    onChange={(e) => setEditableTitle(e.target.value)}
                    className="form-input"
                  />
                ) : (
                  <span onDoubleClick={handleDoubleClick}>
                    {selectedDocument.title}
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                {new Date(selectedDocument.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                {editMode ? (
                  <input
                    type="text"
                    value={editableDescription}
                    onChange={(e) => setEditableDescription(e.target.value)}
                    className="form-input"
                  />
                ) : (
                  <span onDoubleClick={handleDoubleClick}>
                    {selectedDocument.description || "No description provided"}
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                {editMode ? (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSave(selectedDocument.id)}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ marginLeft: '10px' }}
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleViewDocumentContent(selectedDocument.id)}
                    >
                      View
                    </button>
                    <button className="btn btn-secondary" style={{ marginLeft: '10px' }} onClick={() => window.open(downloadUrl, '_blank')}>Download</button>
                    <button
                      className="btn btn-danger"
                      style={{ marginLeft: "10px" }}
                      onClick={() => handleDeleteDocument(selectedDocument.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const handleViewDocumentContent = async (fileId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/admin");
      return;
    }

    try {
      const response = await axios.get(`${VITE_URL_API}/document/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data && response.data.links && response.data.links.webViewLink) {
        window.open(response.data.links.webViewLink, '_blank');
        setDownloadUrl(response.data.links.webContentLink);
      } else {
        setDownloadUrl("");
        toast.error("No preview available for this document.");
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ouverture du document');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditableTitle(selectedDocument?.title || '');
    setEditableDescription(selectedDocument?.description || '');
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
