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
// import SaveAsOutlinedIcon from '@mui/icons-material/SaveAsOutlined';
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

  const cleanNodework = () => {
    window.sendToServer("clear", {});
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
        <ListItem key='cleanNodework' disablePadding>
          <ListItemButton onClick={cleanNodework}>
            <ListItemIcon> <FileOpenOutlinedIcon /> </ListItemIcon>
            <ListItemText primary={'Clean'} />
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
        <ListItem key='myrepairs2' disablePadding>
          <ListItemButton onClick={() => window.nodes.saveNodework()}>
            <ListItemIcon> <SaveOutlinedIcon /> </ListItemIcon>
            <ListItemText primary={'Save'} />
          </ListItemButton>
        </ListItem>
        {/*
        <ListItem key='myrepairs3' disablePadding>
          <ListItemButton onClick={showSaveAsFiles}>
            <ListItemIcon><SaveAsOutlinedIcon /></ListItemIcon>
            <ListItemText primary={'Save As'} />
          </ListItemButton>
        </ListItem>
      
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