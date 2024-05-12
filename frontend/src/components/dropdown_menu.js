import React, { useState, useEffect } from 'react';
import data from '../data-paths.json';

function DropdownMenu({ onSelect }) {
  const [paths, setPaths] = useState([]);

  /*
  ? fetch JSON
  */

  useEffect(() => {
    setPaths(data.paths);
  }, []);

  const handleSelect = (event) => {
    const selectedPath = event.target.value;
    onSelect(selectedPath);
  };

  return (
    <select onChange={handleSelect}>
      <option value="">Select a path</option>
      {paths.map((path, index) => (
        <option key={index} value={path}>{path}</option>
      ))}
    </select>
  );
}

export default DropdownMenu;

