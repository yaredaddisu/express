import React, { useState } from 'react';
import axios from 'axios';

const Material = () => {
  const [formData, setFormData] = useState({
    materials: []  // Initialize with an empty array
  });

  const handleMaterialChange = (id, field, value) => {
    setFormData(prevState => ({
      ...prevState,
      materials: prevState.materials.map(material =>
        material.id === id ? { ...material, [field]: value } : material
      )
    }));
  };

  const handleRemoveMaterial = (id) => {
    setFormData(prevState => ({
      ...prevState,
      materials: prevState.materials.filter(material => material.id !== id)
    }));
  };

  const addMaterial = () => {
    setFormData(prevState => ({
      ...prevState,
      materials: [
        ...prevState.materials,
        { id: Date.now(), materialUsed: '', mst: '', qty: '', remark: '' }
      ]
    }));
  };

  const sendMaterials = async () => {
    try {
      const response = await axios.post('/materials', {
        materials: formData.materials
      } );

      console.log(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <label>Materials and Spare Parts Used:</label>
      {formData.materials.map((material) => (
        <div key={material.id} className="material-row">
          <input
            className="material-input"
            type="text"
            value={material.materialUsed}
            onChange={(e) => handleMaterialChange(material.id, 'materialUsed', e.target.value)}
            placeholder="Material Used"
          />
          <input
            className="material-input"
            type="number"
            value={material.mst}
            onChange={(e) => handleMaterialChange(material.id, 'mst', e.target.value)}
            placeholder="MST"
          />
          <input
            className="material-input"
            type="number"
            value={material.qty}
            onChange={(e) => handleMaterialChange(material.id, 'qty', e.target.value)}
            placeholder="Qty"
          />
          <input
            className="material-input"
            type="text"
            value={material.remark}
            onChange={(e) => handleMaterialChange(material.id, 'remark', e.target.value)}
            placeholder="Remark (Replaced, Repaired, Reconfigured, Reinstallation…)"
          />
          <button type="button" onClick={() => handleRemoveMaterial(material.id)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={addMaterial}>
        Add Material
      </button>
      <button type="button" onClick={sendMaterials}>
        Save Materials
      </button>
    </div>
  );
};

export default Material;
