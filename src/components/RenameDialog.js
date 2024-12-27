import { useRef } from 'react';
import {
  Box,
  Modal,
  TextField,
  Button
} from '@mui/material';

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
  
export default function RenameDialog({visible, show, filename, saveAs}) {
  const textRef = useRef(null);

  const handleClose = () => {
    console.dlog("SAVEAS"+saveAs)
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