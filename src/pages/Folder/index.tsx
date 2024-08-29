import React, { useEffect, useState } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faFileAlt, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import './folder.css';

interface FileProps {
  id: number;
  title: string;
}

interface FolderProps {
  id: number;
  name: string;
  files: FileProps[];
  children: FolderProps[];
  onDeleteFolder: (folderId: number) => void;
  onRenameFolder: (folderId: number, newName: string) => void;
  onDropFile: (fileId: number, folderId: number) => void;
  onDropFolder: (folderId: number, targetFolderId: number) => void;
}

const DraggableFile: React.FC<{ file: FileProps }> = ({ file }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'file',
    item: { id: file.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div className="file-item" ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <FontAwesomeIcon icon={faFileAlt} /> {file.title}
    </div>
  );
};

const DraggableFolder: React.FC<{ folder: FolderProps }> = ({ folder }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'folder',
    item: { id: folder.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    begin: () => {
      console.log(`Dragging started for folder: ${folder.name} (ID: ${folder.id})`);
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult) {
        console.log(`Dropped folder: ${folder.name} (ID: ${folder.id}) into folder ID:}`);
      } else {
        console.log(`Dragging ended for folder: ${folder.name} (ID: ${folder.id}) but it was not dropped into a folder.`);
      }
    },
  }));

  return (
    <div className="folder-item" ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <FontAwesomeIcon icon={faFolder} /> {folder.name}
    </div>
  );
};

const DroppableFolder: React.FC<FolderProps> = ({
  id,
  name,
  files,
  children,
  onDeleteFolder,
  onRenameFolder,
  onDropFile,
  onDropFolder,
}) => {
  const [, drop] = useDrop(() => ({
    accept: ['file', 'folder'],
    drop: (item: { id: number }, monitor) => {
      const itemType = monitor.getItemType();
      if (itemType === 'file') {
        console.log(`Dropped file ID: ${item.id} into folder: ${name} (ID: ${id})`);
        onDropFile(item.id, id);
      } else if (itemType === 'folder') {
        console.log(`Dropped folder ID: ${item.id} into folder: ${name} (ID: ${id})`);
        onDropFolder(item.id, id);
      }

      return { targetFolderId: id };
    },
  }));

  const [isRenaming, setIsRenaming] = useState(false);
  const [newFolderName, setNewFolderName] = useState(name);

  return (
    <div className="folder" ref={drop}>
      <div className="folder-header">
        {isRenaming ? (
          <>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
            <button onClick={() => { onRenameFolder(id, newFolderName); setIsRenaming(false); }}>Save</button>
          </>
        ) : (
          <>
            <h3 onDoubleClick={() => setIsRenaming(true)}>
              <FontAwesomeIcon icon={faFolder} /> {name}
            </h3>
            <div className="folder-actions">
              <button onClick={() => setIsRenaming(true)}>
                <FontAwesomeIcon icon={faEdit} /> Rename
              </button>
              <button onClick={() => onDeleteFolder(id)}>
                <FontAwesomeIcon icon={faTrash} /> Delete
              </button>
            </div>
          </>
        )}
      </div>
      <div className="folder-files">
        {Array.isArray(files) && files.length > 0 ? (
          files.map((file) => (
            <DraggableFile key={file.id} file={file} />
          ))
        ) : (
          <p>No files</p>
        )}
      </div>
      <div className="folder-children">
        {Array.isArray(children) && children.length > 0 ? (
          children.map((childFolder) => (
            <DroppableFolder
              key={childFolder.id}
              {...childFolder}
              onDeleteFolder={onDeleteFolder}
              onRenameFolder={onRenameFolder}
              onDropFile={onDropFile}
              onDropFolder={onDropFolder}
            />
          ))
        ) : (
          <p>No subfolders</p>
        )}
      </div>
    </div>
  );
};

const FolderManager: React.FC = () => {
  const VITE_URL_API = "http://localhost:3000";

  const [folders, setFolders] = useState<FolderProps[]>([]);
  const [files, setFiles] = useState<FileProps[]>([]);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    const fetchFoldersAndFiles = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const folderResponse = await axios.get(`${VITE_URL_API}/folders`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const fileResponse = await axios.get(`${VITE_URL_API}/documents`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const foldersWithFilesAndChildren = folderResponse.data.map((folder: any) => ({
          ...folder,
          files: folder.documents || [],
          children: folder.children || [],
        }));

        setFolders(foldersWithFilesAndChildren);
        setFiles(fileResponse.data);
      } catch (error) {
        console.error('Failed to fetch folders and files:', error);
      }
    };

    fetchFoldersAndFiles();
  }, [VITE_URL_API]);

  const handleDropFile = async (fileId: number, folderId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(`${VITE_URL_API}/folders/${folderId}/add-file`, { fileId }, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const movedFile = files.find((file) => file.id === fileId);

      if (movedFile) {
        setFolders((prevFolders) =>
          prevFolders.map((folder) =>
            folder.id === folderId
              ? { ...folder, files: [...folder.files, movedFile] }
              : folder
          )
        );

        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
      }
    } catch (error) {
      console.error('Failed to move file to folder:', error);
    }
  };

  const handleDropFolder = async (folderId: number, targetFolderId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(`${VITE_URL_API}/folders/${targetFolderId}/add-folder`, { folderId }, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      setFolders((prevFolders) => {
        const folderToMove = prevFolders.find((folder) => folder.id === folderId);
        if (!folderToMove) return prevFolders;

        return prevFolders
          .filter((folder) => folder.id !== folderId)
          .map((folder) =>
            folder.id === targetFolderId
              ? { ...folder, children: [...folder.children, folderToMove] }
              : folder
          );
      });
    } catch (error) {
      console.error('Failed to move folder:', error);
    }
  };

  const handleCreateFolder = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.post(
        `${VITE_URL_API}/folder`,
        { name: newFolderName },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setFolders([...folders, response.data]);
      setNewFolderName('');
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleDeleteFolder = async (folderId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.delete(`${VITE_URL_API}/folder/${folderId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      setFolders((prevFolders) => prevFolders.filter((folder) => folder.id !== folderId));
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  };

  const handleRenameFolder = async (folderId: number, newName: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.patch(`${VITE_URL_API}/folder/${folderId}`, { name: newName }, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      setFolders((prevFolders) =>
        prevFolders.map((folder) =>
          folder.id === folderId ? { ...folder, name: newName } : folder
        )
      );
    } catch (error) {
      console.error('Failed to rename folder:', error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="folder-manager">
        <h1>Gestion des Fichiers et Dossiers</h1>
        <div className="create-folder">
          <input
            type="text"
            placeholder="Nom du nouveau dossier"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <button onClick={handleCreateFolder}>Créer un dossier</button>
        </div>

        <div className="folder-list">
          {folders.map((folder) => (
            <DroppableFolder
              key={folder.id}
              id={folder.id}
              name={folder.name}
              files={folder.files || []}
              children={folder.children || []}
              onDeleteFolder={handleDeleteFolder}
              onRenameFolder={handleRenameFolder}
              onDropFile={handleDropFile}
              onDropFolder={handleDropFolder}
            />
          ))}
        </div>

        <div className="file-list">
          <h3>Fichiers non classés</h3>
          {files.map((file) => (
            <DraggableFile key={file.id} file={file} />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default FolderManager;
