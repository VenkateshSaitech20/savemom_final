import Grid from '@mui/material/Grid';
import BackupViews from './BackupViews';

const BackupViewsInd = () => {
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <BackupViews />
            </Grid>
        </Grid>
    )
}

export default BackupViewsInd
