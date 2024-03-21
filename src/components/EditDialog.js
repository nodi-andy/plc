import React, {useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Drawer from '@mui/material/Drawer';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export default function EditDialog({ showEditMenu, setShowEditMenu }) {
  const [update, setUpdate] = useState(false);
  const [selectedValues, setSelectedValues] = useState({});

  const toggleEditDialog = (open) => (event) => {
    if (event.type === 'click') {
      setShowEditMenu(open);
    }
  };
  
  window.updateEditDialog = () => {
      setUpdate(!update);
  };

  const handlePropertyChange = (event, key, child) => {
    let { value } = event.target;
    if (child != null) value = child.props.children;
    //if (isNaN(value) == false) value = parseInt(value);
    let msg = {nodeID: window.canvas.current_node.nodeID, properties: {}};
    msg.properties[key] = {inpValue: value};
    window.NodeWork.cmd(window.nodeWork, {cmd: "updateInputs", data: msg});
    event.stopPropagation(); // Stop event propagation to prevent closing the drawer
  };


  return (
    <div>
      <React.Fragment key={'right'}>
        <Drawer disableEnforceFocus anchor={'right'} open={showEditMenu} onClose={toggleEditDialog(false)}>
          <Box sx={{ width: 250 }}  style={{ display: 'flex', flexDirection: 'column' }} role="presentation" onClick={toggleEditDialog(false)} onKeyDown={toggleEditDialog(false)}>
            {window.canvas?.current_node?.properties && Object.entries(window.canvas?.current_node?.properties).map(([key, prop]) => (
              <TextField
                  label = {key}
                  defaultValue = {prop?.value}
                  select = {window.canvas?.current_node.type == "basic/inserter" && (key == "to" || key == "from")}

                  sx = {{ margin: '8px' }}
                  onChange={(event, child) => handlePropertyChange(event, key, child)}
                  onClick = {(event) => event.stopPropagation()} // Stop event propagation to prevent closing the drawer
              >

              {
                ((key) => {
                  let pinName = key === "to" ? "toNodeID" : "fromNodeID";
                  return (
                    window.nodeWork.nodes[window.canvas?.current_node[pinName]]?.properties && 
                    Object.entries(window.nodeWork.nodes[window.canvas?.current_node[pinName]]?.properties).map(([pinkey, pinprop]) => (
                      <MenuItem key={pinkey} value={pinkey}>
                        {pinkey}
                      </MenuItem>
                    ))
                  );
                })(key)
              }
                </TextField>
            ))}
          </Box>
        </Drawer>
      </React.Fragment>
    </div>
  );
}
