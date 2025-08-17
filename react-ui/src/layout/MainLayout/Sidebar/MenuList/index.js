import React, { useState } from 'react';
import axios from 'axios';

import {
    ListItemButton, ListItemIcon, ListItemText,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Typography
} from '@material-ui/core';
import { IconMessageChatbot } from '@tabler/icons';
import NavGroup from './NavGroup';
import menuItem from './../../../../menu-items';

const MenuList = () => {
    const [openReportModal, setOpenReportModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState('');
    const [file, setFile] = useState(null);

    const handleSend = async () => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('message', message);
        if (file && file.length > 0) {
            file.forEach((img, index) => {
                formData.append('files[]', img);
            });
        }
    
        try {
            const response = await axios.post("http://xds3.cmbm.idv.tw:81/api/users/report", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
    
            if (response.status === 200) {
                setSuccess(true);
                setIsLoading(false);
                setMessage('');
                setFile([]);
    
            } else {
                setIsLoading(false);
            }
        } catch (err) {
            alert('Error: ' + err.message);
            setIsLoading(false);
        }
    };

    const navItems = menuItem.items.map((item) =>
        item.type === 'group'
            ? <NavGroup key={item.id} item={item} />
            : <Typography key={item.id} variant="h6" color="error" align="center">Menu Items Error</Typography>
    );

    
    const SURVEY_URL =
    'https://docs.google.com/forms/d/e/1FAIpQLScIpheg36UVkEw9nRU__cTLikHDF4fyU0BRf57bzBTZbNW6Jg/viewform';

    const listItemSx = {
        '& .MuiListItemText-primary': {
            fontWeight: 300,
            color: '#616161',
            marginLeft: '-2px'
        },
        '&:hover': {
            borderRadius: '12px',
            '& .MuiListItemText-primary': { color: '#00acc1' }
        }
    }

    const ctaBtnSx = {
        backgroundColor: '#1565c0 !important',
        color: '#fff',
        '&:hover': { backgroundColor: '#0d47a1 !important' },
        '&.Mui-disabled': { backgroundColor: '#90caf9', color: '#fff' }
    } 

    const SurveyButton = (
        <ListItemButton
            component="a"
            href={SURVEY_URL}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ paddingBottom: '16px', ...listItemSx }}
        >
            <ListItemIcon sx={{ marginLeft: '-1px' }}>
            <IconMessageChatbot size={20} strokeWidth={1.5} />
            </ListItemIcon>
            <ListItemText primary="Take Survey" />
        </ListItemButton>
    );

    const ReportIssueButton = (
        <ListItemButton onClick={() => setOpenReportModal(true)} sx={listItemSx}>
            <ListItemIcon sx={{ marginLeft: '-1px' }}>
            <IconMessageChatbot size={20} strokeWidth={1.5} />
            </ListItemIcon>
            <ListItemText primary="Report Issue" />
        </ListItemButton>
    );

    const handleCloseReport = () => {
        setOpenReportModal(false);
        setSuccess(false);
        setMessage('');
        setFile([]);
    };

    const renderReportDialog = () => (
        <Dialog open={openReportModal} onClose={handleCloseReport} fullWidth maxWidth="sm">
            <DialogTitle style={{ fontSize: '1rem' }}>Report an Issue</DialogTitle>
            <DialogContent>
            {success ? (
                <Typography variant="h5" style={{ color: '#5b5b5b', marginTop: 16 }}>
                Thanks for your report! We will soon repair the issue.
                </Typography>
            ) : (
                <>
                <Typography variant="h5" style={{ marginBottom: 8, color: '#5b5b5b' }}>
                    Issue Description
                </Typography>
                <TextField
                    margin="dense"
                    placeholder="Describe the issue..."
                    fullWidth
                    multiline
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />

                <Typography variant="h5" style={{ marginTop: 24, marginBottom: 8, color: '#5b5b5b' }}>
                    Attach Screenshot or Image (Optional)
                </Typography>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setFile(Array.from(e.target.files ?? []))}
                />
                </>
            )}
            </DialogContent>

            <DialogActions>
            {success ? (
                <Button variant="contained" sx={ctaBtnSx} onClick={handleCloseReport}>
                Close
                </Button>
            ) : (
                <>
                <Button onClick={handleCloseReport} disabled={isLoading}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={handleSend} disabled={isLoading} sx={ctaBtnSx}>
                    {isLoading ? 'Sending...' : 'Send'}
                </Button>
                </>
            )}
            </DialogActions>
        </Dialog>
    );

    return (
        <>
          {navItems}
          {SurveyButton}
          {ReportIssueButton}
          {renderReportDialog()}
        </>
      );
};

export default MenuList;
