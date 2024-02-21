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
                  window.serialbuffer = "";
                  window.serialport.open({ baudRate: 115200 }).then(() => {
                    console.log('Port is opened!');
                    window.reader = window.serialport.readable.getReader();
                    window.serialwriter = window.serialport.writable.getWriter();
                    window.nodeWork.engine = {name: "serialport", send: (order) => {
                      console.log("Forward:Serial : ", order);
                      if (window.serialwriter) { // send to server
                        const encoder = new TextEncoder();

                        window.serialwriter.write(encoder.encode(JSON.stringify([order.cmd, order.data])));
                      } 
                      
                      // if (websocket.send && websocket.readyState == 1) { // send to IoT
                        //  websocket.send(JSON.stringify([cmd, obj]));
                        // } 
                    }};
                    const readLoop = () => {
                      window.reader.read().then(({ value, done }) => {
                            if (done) {
                                console.log('Stream closed or reader released.');
                                return;
                            }
                            const receivedData = new TextDecoder().decode(value);
                            //console.log('Data received:', receivedData);
                            window.serialbuffer += receivedData;
                            let newlineIndex = window.serialbuffer.indexOf('\n');
                            while (newlineIndex !== -1) {
                                // Extract the line including the newline character
                                let line = window.serialbuffer.substring(0, newlineIndex + 1);
                                // Call the function with the extracted line
                                if (window.serialline) window.serialline(line);

                                // Remove the processed line from the buffer
                                window.serialbuffer = window.serialbuffer.substring(newlineIndex + 1);

                                // Check for another newline character in the remaining buffer
                                newlineIndex = window.serialbuffer.indexOf('\n');
                            }
                            // Continue reading
                            readLoop();
                        }).catch(error => {
                            console.error('Error reading from serial port:', error);
                        });
                    };
                    readLoop();
                });
              })
            }}>
            <ListItemIcon> <SaveOutlinedIcon /> </ListItemIcon>
            <ListItemText primary={'Serial Port'} />
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