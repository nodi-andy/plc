import React, {useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Drawer from '@mui/material/Drawer';
import Checkbox from '@mui/material/Checkbox';

export default function EditDialog({ showEditMenu, setShowEditMenu }) {
  const [update, setUpdate] = useState(false);

  const toggleEditDialog = (open) => (event) => {
    if (event.type === 'click') {
      setShowEditMenu(open);
    }
  };

  
  window.updateEditDialog = () => {
      setUpdate(!update);
  };

  const handlePropertyChange = (event, key) => {
    const { value } = event.target;
    window.canvas.current_node.updateProperties(key, "value", value);
    window.canvas.current_node.update = true;
    event.stopPropagation(); // Stop event propagation to prevent closing the drawer
  };

  const handleCheckboxChange = (event) => {
    event.stopPropagation(); // Stop event propagation to prevent closing the drawer
    if (event.target.checked) {
      window.canvas.current_node.addInputByName(event.target.id);

    } else {
      window.canvas.current_node.removeInputByName(event.target.id);
    }
  };

  const handleOutputCheckboxChange = (event) => {
    event.stopPropagation(); // Stop event propagation to prevent closing the drawer
    if (event.target.checked) {
      window.canvas.current_node.addOutputByName(event.target.id);
    } else {
      window.canvas.current_node.removeOutputByName(event.target.id);
    }
  };

  return (
    <div>
      <React.Fragment key={'right'}>
        <Drawer disableEnforceFocus anchor={'right'} open={showEditMenu} onClose={toggleEditDialog(false)}>
          <Box sx={{ width: 250 }} role="presentation" onClick={toggleEditDialog(false)} onKeyDown={toggleEditDialog(false)}>
            {window.canvas?.current_node?.properties && Object.entries(window.canvas?.current_node?.properties).map(([key, value]) => (
              <div style={{ display: 'flex', alignItems: 'center' }} key={key}>
                <Checkbox 
                  checked = {value.input} 
                  id={key}
                  onChange={handleCheckboxChange} 
                  onClick={(event) => event.stopPropagation()} />
                <TextField
                  label={key}
                  id="outlined-size-small"
                  defaultValue= {value.value}
                  sx={{ margin: '8px' }}
                  onChange={(event) => handlePropertyChange(event, key)}
                  onClick={(event) => event.stopPropagation()} // Stop event propagation to prevent closing the drawer
                />
                <Checkbox 
                  checked = {value.output} 
                  id={key}
                  onChange={handleOutputCheckboxChange} 
                  onClick={(event) => event.stopPropagation()} />
              </div>
            ))}
          </Box>
        </Drawer>
      </React.Fragment>
    </div>
  );
}
