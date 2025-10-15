import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Plus, Edit, Trash2, FileText, Newspaper, X, Save } from 'lucide-react';
import '../Styles/AdminPortail.css';

function AdminPortail() {
  const [activeTab, setActiveTab] = useState('actualites');
  const [actualites, setActualites] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  // Formulaire pour actualité
  const [formActualite, setFormActualite] = useState({
    titre: '',
    image: '',
    extrait: '',
    contenu: '',
    categorie: '',
    auteur: ''
  });

  // Formulaire pour document
  const [formDocument, setFormDocument] = useState({
    titre: '',
    description: '',
    type: '',
    categorie: '',
    taille: '',
    fichier: ''
  });

  // États pour les fichiers uploadés
  const [imageFile, setImageFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [actualitesRes, documentsRes] = await Promise.all([
        fetch('http://localhost:4000/api/actualites'),
        fetch('http://localhost:4000/api/documents')
      ]);

      if (actualitesRes.ok && documentsRes.ok) {
        const actualitesData = await actualitesRes.json();
        const documentsData = await documentsRes.json();
        setActualites(actualitesData);
        setDocuments(documentsData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const handleAddNew = () => {
    setEditMode(false);
    setCurrentItem(null);
    setImageFile(null);
    setDocumentFile(null);
    if (activeTab === 'actualites') {
      setFormActualite({
        titre: '',
        image: '',
        extrait: '',
        contenu: '',
        categorie: '',
        auteur: ''
      });
    } else {
      setFormDocument({
        titre: '',
        description: '',
        type: '',
        categorie: '',
        taille: '',
        fichier: ''
      });
    }
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditMode(true);
    setCurrentItem(item);
    if (activeTab === 'actualites') {
      setFormActualite(item);
    } else {
      setFormDocument(item);
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      return;
    }

    try {
      const endpoint = activeTab === 'actualites' ? 'actualites' : 'documents';
      const response = await fetch(`http://localhost:4000/api/${endpoint}/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchData();
        alert('Élément supprimé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:4000/api/upload/image', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return data.url;
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      return null;
    }
  };

  const handleDocumentUpload = async (file) => {
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await fetch('http://localhost:4000/api/upload/document', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let data = activeTab === 'actualites' ? { ...formActualite } : { ...formDocument };

      // Upload de l'image pour les actualités
      if (activeTab === 'actualites' && imageFile) {
        const imageUrl = await handleImageUpload(imageFile);
        if (imageUrl) {
          data.image = imageUrl;
        }
      }

      // Upload du document
      if (activeTab === 'documents' && documentFile) {
        const uploadResult = await handleDocumentUpload(documentFile);
        if (uploadResult) {
          data.fichier = uploadResult.url;
          data.taille = uploadResult.size;
        }
      }

      const endpoint = activeTab === 'actualites' ? 'actualites' : 'documents';
      const url = editMode 
        ? `http://localhost:4000/api/${endpoint}/${currentItem.id}`
        : `http://localhost:4000/api/${endpoint}`;
      
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        fetchData();
        setShowModal(false);
        setImageFile(null);
        setDocumentFile(null);
        alert(editMode ? 'Élément modifié avec succès' : 'Élément ajouté avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="admin-portail-container">
        <div className="admin-header">
          <h1>Administration du Portail</h1>
          <Link to="/plateforme-gestion" className="back-to-portal">
            Retour au portail
          </Link>
        </div>

        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'actualites' ? 'active' : ''}`}
            onClick={() => setActiveTab('actualites')}
          >
            <Newspaper size={20} />
            Actualités
          </button>
          <button 
            className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <FileText size={20} />
            Documents Juridiques
          </button>
        </div>

        <div className="admin-content">
          <div className="admin-toolbar">
            <h2>{activeTab === 'actualites' ? 'Gestion des Actualités' : 'Gestion des Documents'}</h2>
            <button className="btn-add" onClick={handleAddNew}>
              <Plus size={20} />
              Ajouter
            </button>
          </div>

          {activeTab === 'actualites' ? (
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Catégorie</th>
                    <th>Auteur</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {actualites.map((actualite) => (
                    <tr key={actualite.id}>
                      <td>{actualite.titre}</td>
                      <td><span className="badge">{actualite.categorie}</span></td>
                      <td>{actualite.auteur}</td>
                      <td>{new Date(actualite.date).toLocaleDateString('fr-FR')}</td>
                      <td className="actions">
                        <button className="btn-edit" onClick={() => handleEdit(actualite)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn-delete" onClick={() => handleDelete(actualite.id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Type</th>
                    <th>Catégorie</th>
                    <th>Date</th>
                    <th>Taille</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td>{doc.titre}</td>
                      <td><span className="badge">{doc.type}</span></td>
                      <td>{doc.categorie}</td>
                      <td>{new Date(doc.date).toLocaleDateString('fr-FR')}</td>
                      <td>{doc.taille}</td>
                      <td className="actions">
                        <button className="btn-edit" onClick={() => handleEdit(doc)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn-delete" onClick={() => handleDelete(doc.id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal pour ajouter/modifier */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editMode ? 'Modifier' : 'Ajouter'} {activeTab === 'actualites' ? 'une actualité' : 'un document'}</h3>
                <button className="btn-close" onClick={() => setShowModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                {activeTab === 'actualites' ? (
                  <>
                    <div className="form-group">
                      <label>Titre *</label>
                      <input
                        type="text"
                        value={formActualite.titre}
                        onChange={(e) => setFormActualite({...formActualite, titre: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Image *</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        className="file-input"
                      />
                      {imageFile && (
                        <p className="file-name">📷 {imageFile.name}</p>
                      )}
                      {formActualite.image && !imageFile && (
                        <p className="current-file">Image actuelle: {formActualite.image}</p>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Extrait *</label>
                      <textarea
                        value={formActualite.extrait}
                        onChange={(e) => setFormActualite({...formActualite, extrait: e.target.value})}
                        rows="3"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Contenu (HTML) *</label>
                      <textarea
                        value={formActualite.contenu}
                        onChange={(e) => setFormActualite({...formActualite, contenu: e.target.value})}
                        rows="8"
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Catégorie *</label>
                        <input
                          type="text"
                          value={formActualite.categorie}
                          onChange={(e) => setFormActualite({...formActualite, categorie: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Auteur *</label>
                        <input
                          type="text"
                          value={formActualite.auteur}
                          onChange={(e) => setFormActualite({...formActualite, auteur: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Titre *</label>
                      <input
                        type="text"
                        value={formDocument.titre}
                        onChange={(e) => setFormDocument({...formDocument, titre: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Description *</label>
                      <textarea
                        value={formDocument.description}
                        onChange={(e) => setFormDocument({...formDocument, description: e.target.value})}
                        rows="3"
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Type *</label>
                        <select
                          value={formDocument.type}
                          onChange={(e) => setFormDocument({...formDocument, type: e.target.value})}
                          required
                        >
                          <option value="">Sélectionner</option>
                          <option value="Loi">Loi</option>
                          <option value="Décret">Décret</option>
                          <option value="Arrêté">Arrêté</option>
                          <option value="Règlement">Règlement</option>
                          <option value="Guide">Guide</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Catégorie *</label>
                        <input
                          type="text"
                          value={formDocument.categorie}
                          onChange={(e) => setFormDocument({...formDocument, categorie: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Fichier PDF *</label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setDocumentFile(e.target.files[0])}
                        className="file-input"
                      />
                      {documentFile && (
                        <p className="file-name">📄 {documentFile.name} ({(documentFile.size / (1024 * 1024)).toFixed(2)} MB)</p>
                      )}
                      {formDocument.fichier && !documentFile && (
                        <p className="current-file">Fichier actuel: {formDocument.fichier}</p>
                      )}
                    </div>
                  </>
                )}

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn-save" disabled={uploading}>
                    <Save size={20} />
                    {uploading ? 'Upload en cours...' : (editMode ? 'Modifier' : 'Ajouter')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default AdminPortail;
