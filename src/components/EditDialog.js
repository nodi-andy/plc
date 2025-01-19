import React, { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Drawer from '@mui/material/Drawer';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';

export default function EditDialog({ showEditMenu, setShowEditMenu }) {
  const [update, setUpdate] = useState(false);
  const drawTextRef = useRef(null);
  const runTextRef = useRef(null);

  const toggleEditDialog = (open) => (event) => {
    if (event.type === 'click') {
      setShowEditMenu(open);
      if (window.current_node?.type === "basic/custom" && runTextRef.current) {
        const runStr = runTextRef.current.value; // Access the value of the multiline TextField
        window.current_node.runStr = runStr;
        window.current_node.run = new Function('node', runStr);
      }
      if (window.current_node?.type === "basic/custom" && drawTextRef.current) {
        const drawStr = drawTextRef.current.value; // Access the value of the multiline TextField
        window.current_node.drawStr = drawStr;
        window.current_node.onDrawForeground = new Function('node', 'ctx', drawStr);
      }
    }
  };

  const handleSave = () => {
    const data = {
      nodeID: window.current_node.nodeID,
      runStr: runTextRef.current?.value,
      drawStr: drawTextRef.current?.value,
    };
    // Send data to the server
    window.sendToNodework('updateCode', data);
  };

  window.updateEditDialog = () => {
    setUpdate(!update);
  };

  const handlePropertyChange = (event, key, child) => {
    let { value } = event.target;
    if (child != null) value = child.props.children;
    //if (isNaN(value) == false) value = parseInt(value);
    let msg = {nodeID: window.current_node.nodeID, properties: {}};
    msg.properties[key] = {inpValue: value};
    window.updateInputs(window.current_node.nodeID, msg);

    event.stopPropagation(); // Stop event propagation to prevent closing the drawer
  };


  return (
    <div>
      <React.Fragment key={'right'}>
        <Drawer disableEnforceFocus anchor={'right'} open={showEditMenu} onClose={toggleEditDialog(false)}>
          <Box 
            sx={{ width: window.current_node?.type === "basic/custom" ? 600 : 250 }}
            style={{ display: 'flex', flexDirection: 'column' }} role="presentation" onClick={toggleEditDialog(false)} onKeyDown={toggleEditDialog(false)}>
            { window.current_node?.properties && Object.entries(window.current_node?.properties).map(([key, prop]) => (
              <TextField
                  label = {key}
                  defaultValue = {prop?.value}
                  select = {window.current_node.type == "basic/inserter" && (key == "to" || key == "from")}

                  sx = {{ margin: '8px' }}
                  onChange={(event, child) => handlePropertyChange(event, key, child)}
                  onClick = {(event) => event.stopPropagation()} // Stop event propagation to prevent closing the drawer
              >

              {
                ((key) => {
                  if (key !== "to" && key !== "from") {
                    return null;
                  }
                  let pinName = key === "to" ? "toNodeID" : "fromNodeID";
                  return (
                    window.current_node[pinName]?.properties && 
                    Object.entries(window.current_node[pinName].properties).map(([pinkey, pinprop]) => (
                      <MenuItem key={pinkey} value={pinkey}>
                        {pinkey}
                      </MenuItem>
                    ))
                  );
                })(key)
              }
              </TextField>
              )) }
              {window.current_node?.type === "basic/custom" && (
                <TextField
                  inputRef={runTextRef} // Attach the ref to the TextField
                  onClick = {(event) => event.stopPropagation()} // Stop event propagation to prevent closing the drawer
                  sx = {{ margin: '8px' }}
                  id="standard-multiline-static"
                  label="run"
                  multiline
                  rows={16}
                  defaultValue = {window.current_node.runStr}
                />
              )}
              {window.current_node?.type === "basic/custom" && (
                <TextField
                  inputRef={drawTextRef} // Attach the ref to the TextField
                  onClick = {(event) => event.stopPropagation()} // Stop event propagation to prevent closing the drawer
                  sx = {{ margin: '8px' }}
                  id="standard-multiline-static"
                  label="draw"
                  multiline
                  rows={16}
                  defaultValue = {window.current_node.drawStr}
                />
              )}
              <Button variant="contained" color="primary" onClick={handleSave} style={{ position: 'absolute', bottom: 16, right: 16 }}>
                Save
              </Button>
          </Box>
        </Drawer>
      </React.Fragment>
    </div>
  );
}
