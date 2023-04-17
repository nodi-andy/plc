import { useState, useRef } from 'react';
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
  Modal,
  Snackbar,
  Button,
  TextField,
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

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};


function RenameDialog({visible, show, filename, saveAs}) {
  const textRef = useRef(null);

  const handleClose = () => {
    console.log("SAVEAS"+saveAs)
    show(false);
  };

  const handleRename = () => {
    var currentFiles = JSON.parse(localStorage.files)
    currentFiles[textRef.current.value] = currentFiles[filename]
    delete currentFiles[filename]
    localStorage.files = JSON.stringify(currentFiles)
    show(false);
  };

  const handleSaveAs= () => {
    var currentFiles = JSON.parse(localStorage.files)
    currentFiles[textRef.current.value] = currentFiles[filename]
    localStorage.files = JSON.stringify(currentFiles)
    localStorage.selected = textRef.current.value
    show(false);
  };

  return (
      <Modal
        open={visible}
        onClose={handleClose}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Box sx={{ ...style, width: 200 }}>
          <TextField
            id="outlined-helperText"
            label="New file name"
            defaultValue = {filename}
            inputRef = {textRef}
          />
          {saveAs ? <Button onClick={handleSaveAs}>Save As</Button> : <Button onClick={handleRename}>Rename</Button>}
          <Button onClick={handleClose}>Cancel</Button>
          
        </Box>
      </Modal>
  );
}

function SelectFileDialog({ openND, setOpenND }) {
  const [renameDialogVisible, showRenameDialog] = useState(false);
  const [filename, setFilename] = useState("");

  const handleRename = (newFileName) => {
    setFilename(newFileName);
    showRenameDialog(true);
  };


  const handleClose = () => {
    setOpenND(false);
  };

  return (
      <Dialog  open={openND} onClose={handleClose}>
        <DialogTitle>Files</DialogTitle>
        <DialogContent>
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', }}>
            <List>
              { localStorage.files ? 
                Object.keys(JSON.parse(localStorage.files)).map((label, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton>
                      <ListItemText primary={label} onClick={() => {window.load(label); handleClose()} }/>
                    </ListItemButton>
                  </ListItem>
                )) : <></>
            }
            </List>
            <List>
              {localStorage.files ? Object.keys(JSON.parse(localStorage.files)).map((label, index) => (
                  <ListItem key={index} disablePadding>
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

function FullWidthGrid({ category, setOpen }) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        {window.nodes.list[category].map((label) => (
          <Grid key={label} item>
            <Button
              variant="outlined"
              onClick={() => {
                window.nodes.addNode(`${category}/${label}`);
                setOpen(false);
              }}>
              {label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function BasicTabs({ setOpen }) {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          {Object.keys(window.nodes.list).map((label, index) => (
            <Tab key={"TabKey" + label} label={label} {...a11yProps(index)} />
          ))}
        </Tabs>
      </Box>
      {Object.keys(window.nodes.list).map((label, index) => (
        <TabPanel key={"Panel" + label} value={value} index={index}>
          <FullWidthGrid category={label} setOpen={setOpen} />
        </TabPanel>
      ))}
    </Box>
  );
}

function SelectNodeDialog({ openND, setOpenND }) {
  const handleClose = () => {
    setOpenND(false);
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
          <BasicTabs setOpen={setOpenND} />
        </Box>
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
      <Fab color="info" variant="extended" onClick={showFiles}>
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
      <SelectFileDialog openND={showFiles}  setOpenND={setShowFiles}/>
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
