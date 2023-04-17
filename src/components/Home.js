import { useState } from 'react';
import {
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
  Snackbar,
  Button,
  List,
  Tab,
  Tabs,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import FileOpenOutlinedIcon from '@mui/icons-material/FileOpenOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SaveAsOutlinedIcon from '@mui/icons-material/SaveAsOutlined';
import SendAndArchiveOutlinedIcon from '@mui/icons-material/SendAndArchiveOutlined';
import RenameDialog from './RenameDialog';


function SelectFileDialog({ openFD, setOpenFD }) {
  const [renameDialogVisible, showRenameDialog] = useState(false);
  const [filename, setFilename] = useState("");

  const handleRename = (newFileName) => {
    setFilename(newFileName);
    showRenameDialog(true);
  };


  const handleClose = () => {
    setOpenFD(false);
  };

  return (
      <Dialog  open={openFD} onClose={handleClose}>
        <DialogTitle>Files</DialogTitle>
        <DialogContent>
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', }}>
            <List>
              { localStorage.files ? 
                Object.keys(JSON.parse(localStorage.files)).map((label) => (
                  <ListItem key={label} disablePadding>
                    <ListItemButton>
                      <ListItemText primary={label} onClick={() => {window.load(label); handleClose()} }/>
                    </ListItemButton>
                  </ListItem>
                )) : <></>
            }
            </List>
            <List>
              {localStorage.files ? Object.keys(JSON.parse(localStorage.files)).map((label) => (
                  <ListItem key={label} disablePadding>
                    <ListItemButton onClick={ ()=>handleRename(label) }>
                      <DriveFileRenameOutlineIcon />
                    </ListItemButton>
                    <ListItemButton>
                      <DeleteOutlineIcon />
                    </ListItemButton>
                  </ListItem>
              )) : <></>
            }
            </List>
        </Box>
        <RenameDialog visible = {renameDialogVisible} show = {showRenameDialog} filename = {filename} saveAs = {false}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}


function SelectNodeDialog({ openND, setOpenND }) {
  const handleClose = () => {
    setOpenND(false);
  };

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };


  return (
    <Dialog open={openND} onClose={handleClose}>
      <DialogTitle>Nodes</DialogTitle>
      <DialogContent>
        <Box
          noValidate
          component="form"
          sx={{
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Tabs   variant="scrollable" allowScrollButtonsMobile scrollButtons="auto" value={value} onChange={handleChange} aria-label="basic tabs example">
              {window.nodes?.list && Object.keys(window.nodes.list).map((category, index) => (
                <Tab key={category} label={category} {...a11yProps(index)} />
              ))}
            </Tabs>
          </Box>
          {window.nodes?.list && Object.keys(window.nodes.list).map((category, tabIndex) => (
            <TabPanel key={category} value={value} index={tabIndex}>
            <Box sx={{ flexGrow: 1 }}>
                  <Grid container spacing={2}>
                    {window.nodes.list[category].map((label) => (
                      <Grid key={label} item>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            window.nodes.addNode(`${category}/${label}`);
                            setOpenND(false);
                          }}>
                          {label}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
            </TabPanel>
          ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function SimpleSnackbar({openSB, setopenSB, sbMessage}) {

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setopenSB(false);
  };

  const action = (
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
      </IconButton>
  );

  return (
    <div>
      <Snackbar
        open={openSB}
        autoHideDuration={6000}
        onClose={handleClose}
        message={sbMessage}
        action={action}
      />
    </div>
  );
}

function FloatingActionButtons({ showFiles, showNodes, showSaveAsFiles }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: (theme) => theme.spacing(2),
        height: '100%',
        top: '0',
        justifyContent: 'center',
        gap: 2,
        m: 0.5
      }}>
      <Fab color="primary" variant="extended" aria-label="add" onClick={()=>showNodes(true)}>
        {' '}
        <AddIcon />{' '}
      </Fab>
      <Fab
        color="secondary"
        variant="extended"
        aria-label="remove"
        onClick={() => {
          window.nodes.remNode();
        }}>
        <DeleteOutlineIcon />
      </Fab>
      <Fab
        color="warning"
        variant="extended"
        onClick={() => {
          window.nodes.editNode();
        }}>
        <EditIcon />
      </Fab>
      <Fab color="info" variant="extended" onClick={()=>showFiles(true)}>
        <FileOpenOutlinedIcon />
      </Fab>
      <Fab
        color="success"
        variant="extended"
        onClick={() => {
          window.nodes.saveNodework();
        }}>
        <SaveOutlinedIcon />
      </Fab>
      <Fab color="info" variant="extended" onClick={showSaveAsFiles}>
        <SaveAsOutlinedIcon />
      </Fab>
      <Fab
        color="error"
        variant="extended"
        onClick={() => {
          window.nodes.upload();
        }}>
        <SendAndArchiveOutlinedIcon />
      </Fab>
    </Box>
  );
}

export default function Home() {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [showNodes, setShowNodes] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [showSaveAsFiles, setShowSaveAsFiles] = useState(false);
  const [, setFilename] = useState("");

  window.setFilename = (fn) => {setFilename(fn)}
  window.showSnackbar = (msg) => {window.messageText = msg; setSnackbarOpen(true)}

  return (
    <>
      <SelectNodeDialog openND={showNodes}  setOpenND={setShowNodes}/>
      <SelectFileDialog openFD={showFiles}  setOpenFD={setShowFiles}/>
      <SimpleSnackbar openSB={snackbarOpen}  setopenSB={setSnackbarOpen} sbMessage = {window.messageText}/>
      <RenameDialog visible = {showSaveAsFiles} show = {setShowSaveAsFiles} filename = {localStorage.selected} saveAs = {true}/>
      
      <FloatingActionButtons
        sx={{
          position: 'fixed',
          left: (theme) => theme.spacing(2),
          my: 8
        }}
        showFiles={setShowFiles}
        showNodes={setShowNodes}
        showSaveAsFiles={setShowSaveAsFiles}
      />
    </>
  );
}
