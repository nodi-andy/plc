import  { useState } from "react";
import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    ListItem,
    ListItemButton,
    ListItemText,
    Button,
    List,

  } from '@mui/material';
  import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'
  import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
  import RenameDialog from './RenameDialog';

  export default function SelectFileDialog({ openFD, setOpenFD }) {

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
        <Dialog open={openFD} onClose={handleClose}>
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