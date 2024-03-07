import React from 'react';
//import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import {ListItemButton, ListSubheader } from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
//import GroupIcon from '@mui/icons-material/Group';
import SaveAsOutlinedIcon from '@mui/icons-material/SaveAsOutlined';
import FileOpenOutlinedIcon from '@mui/icons-material/FileOpenOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

export default function NavBar({ openDrawer, setOpenDrawer, /*showSaveAsFiles, showFiles, showConnection */}) {
  //const navigate = useNavigate();
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setOpenDrawer( open );
  };

  const downloadFirmware = () => {
    // Create a new anchor element dynamically
    const element = document.createElement('a');
    
    // Set the href to the file location; adjust the path as necessary
    element.href = '/noditron.bin';
    
    // Set the download attribute to the desired file name
    element.download = 'noditron.bin';
    
    // Append the anchor to the body, click it, and then remove it to start the download
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const clearNodework = () => {
    window.sendToNodework("clear", {});
  };


  const list = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListSubheader>Nodework</ListSubheader>
        <ListItem key='clearNodework' disablePadding>
          <ListItemButton onClick={clearNodework}>
            <ListItemIcon> <FileOpenOutlinedIcon /> </ListItemIcon>
            <ListItemText primary={'Clear'} />
          </ListItemButton>
        </ListItem>
        {/*
        <ListItem key='myneeds1' disablePadding>
          <ListItemButton onClick={showFiles}>
            <ListItemIcon> <FileOpenOutlinedIcon /> </ListItemIcon>
            <ListItemText primary={'Open'} />
          </ListItemButton>
        </ListItem>
      */}
        <ListItem key='saveNodework' disablePadding>
          <ListItemButton onClick={() => window.nodes.saveNodework()}>
            <ListItemIcon> <SaveOutlinedIcon /> </ListItemIcon>
            <ListItemText primary={'Save'} />
          </ListItemButton>
        </ListItem>
        <ListItem key='requestSerialPort' disablePadding>
          <ListItemButton onClick={async () => {
              // Prompt user to select any serial port.
              await navigator.serial.requestPort().then((port) => {
                window.serialport = port;

              })
            }}>
            <ListItemIcon> <SaveOutlinedIcon /> </ListItemIcon>
            <ListItemText primary={'Serial Port'} />
          </ListItemButton>
        </ListItem>
        {
        <ListItem key='download_fw' disablePadding>
          <ListItemButton onClick={downloadFirmware}>
            <ListItemIcon><SaveAsOutlinedIcon /></ListItemIcon>
            <ListItemText primary={'Download Firmware'} />
          </ListItemButton>
        </ListItem>
      /*
        <ListSubheader>IoT</ListSubheader>
        <ListItem key='myoffers' disablePadding>
          <ListItemButton onClick={showConnection}>
            <ListItemIcon> <GroupIcon /> </ListItemIcon>
            <ListItemText primary={'Connection'} />
          </ListItemButton>
        </ListItem>
*/}
        

      </List>
    </Box>
  );

  return (
    <div>
        <React.Fragment key={'left'}>
          <Drawer
            anchor={'left'}
            open={openDrawer}
            onClose={toggleDrawer(false)}
          >
            {list('left')}
          </Drawer>
        </React.Fragment>
    </div>
  );
}