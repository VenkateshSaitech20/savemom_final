'use client'
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import DialogCloseButton from '../DialogCloseButton';
import PropTypes from "prop-types";

const CustomerEnquiryDialog = ({ open, setOpen, data, id }) => {

    const handleClose = () => {
        setOpen(false)
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Intl.DateTimeFormat('en-GB', options).format(date);
    };

    return (
        <Dialog
            fullWidth
            open={open}
            onClose={handleClose}
            maxWidth='md'
            scroll='body'
            sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        >
            <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
                <i className='bx-x' />
            </DialogCloseButton>
            <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
                Customer enquiry
            </DialogTitle>
            <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
                <Grid container spacing={5}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="h6" sx={{ marginBottom: 2 }}>{data?.message}</Typography>
                        <Typography sx={{ fontSize: 14 }}>{data?.name}</Typography>
                        {/* <Typography>{data?.email}</Typography> */}
                        <Typography sx={{ fontSize: 14 }}>{data?.createdAt ? formatDate(data.createdAt) : ''}</Typography>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
                <Button variant='tonal' color='secondary' type='reset' onClick={handleClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    )
}

CustomerEnquiryDialog.propTypes = {
    open: PropTypes.any,
    setOpen: PropTypes.func,
    data: PropTypes.any,
    id: PropTypes.any
};

export default CustomerEnquiryDialog
