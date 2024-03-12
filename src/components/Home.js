import React, { useState } from "react";
import {
  Box,
  Fab,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Button,
  Tab,
  Tabs,
  Grid
} from "@mui/material";

import Rotate90DegreesCcwIcon from "@mui/icons-material/Rotate90DegreesCcw";
import ContentCopyIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import OutputIcon from "@mui/icons-material/Output";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
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
      {...other}
    >
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
    <Dialog open={openND} onClose={handleClose} fullWidth={true} maxWidth={"xl"}>
      <DialogContent>
        <Tabs
          sx={{ borderBottom: 1 }}
          variant="scrollable"
          scrollButtons
          allowScrollButtonsMobile
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          TabIndicatorProps={{ style: { backgroundColor: "red" } }}
        >
          {window.nodes?.list &&
            Object.keys(window.nodes.list).map((category, index) => (
              <Tab key={category} label={category} {...a11yProps(index)} />
            ))}
        </Tabs>
        {window.nodes?.list &&
          Object.keys(window.nodes.list).map((category, tabIndex) => (
            <TabPanel key={category} value={value} index={tabIndex}>
              <Grid container spacing={2}>
                {window.nodes.list[category].map((label) => (
                  <Grid key={label} item>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        let msg = window.createNewNode(`${category}/${label}`);
                        window.sendToNodework('createNode', msg);
                        setOpenND(false);
                      }}
                    >
                      {label}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
          ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function SimpleSnackbar({ openSB, setopenSB, sbMessage }) {
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setopenSB(false);
  };

  const action = <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}></IconButton>;

  return (
    <div>
      <Snackbar open={openSB} autoHideDuration={6000} onClose={handleClose} message={sbMessage} action={action} />
    </div>
  );
}

function RightActionButtons({ showNodes, setShowEditMenu }) {
  const [addClickable, setAddClickable] = useState(false);
  const [rotateClickable, setRotateClickable] = useState(false);
  const [parentClickable, setParentClickable] = useState(false);
  const [editClickable, setEditClickable] = useState(false);
  const [removeClickable, setRemoveClickable] = useState(false);

  window.showRotate = (v) => {
    setRotateClickable(v);
  };

  window.showEdit = (v) => {
    setEditClickable(v);
  };

  window.showParent = (v) => {
    setParentClickable(v);
  };
  window.showAdd = (v) => {
    setAddClickable(v);
  };

  window.showRemove = (v) => {
    setRemoveClickable(v);
  };

  const editMenuClick = () => {
    setShowEditMenu(true);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "start",
          position: "fixed",
          bottom: (theme) => theme.spacing(2),
          top: (theme) => theme.spacing(2),
          right: (theme) => theme.spacing(2),
          gap: 2,
          m: 0.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexGrow: 2,
          }}
        ></Box>
          <Fab
          color="info"
          disabled={!parentClickable}
          onClick={() => {
            window.toParent();
          }}
        >
          <OutputIcon />
        </Fab>
        <Fab
          color="info"
          disabled={!rotateClickable}
          onClick={() => {
            window.sendToNodework("rotateNode", {pos: window.canvas.grid_selected});
          }}
        >
          <Rotate90DegreesCcwIcon />
        </Fab>
        <Fab color="warning" disabled={!editClickable} onClick={editMenuClick}>
          <EditIcon />
        </Fab>
        <Fab
          color="secondary"
          aria-label="remove"
          disabled={!removeClickable}
          onClick={() => {
            window.sendToNodework("removeNode", {pos: window.canvas.grid_selected});
            setShowEditMenu(false);
          }}
        >
          <DeleteOutlineIcon />
        </Fab>
        <Fab color="primary" variant="extended" aria-label="add" onClick={() => window.copyNode()}
          disabled={!addClickable}
          >
          <ContentCopyIcon />
        </Fab>
      </Box>
    </>
  );
}

export default function Home({ setShowEditMenu }) {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [showNodes, setShowNodes] = useState(false);
  const [, setFilename] = useState("");

  window.setFilename = (fn) => {
    setFilename(fn);
  };
  window.showSnackbar = (msg) => {
    window.messageText = msg;
    setSnackbarOpen(true);
  };
  window.setShowNodes = (fn) => {
    setShowNodes(fn);
  };

  return (
    <>
      <SelectNodeDialog openND={showNodes} setOpenND={setShowNodes} />
      <SimpleSnackbar openSB={snackbarOpen} setopenSB={setSnackbarOpen} sbMessage={window.messageText} />

      <RightActionButtons
        showNodes={setShowNodes}
        setShowEditMenu={setShowEditMenu}
        sx={{ position: "fixed", right: (theme) => theme.spacing(2), my: 18 }}
      />
    </>
  );
}
