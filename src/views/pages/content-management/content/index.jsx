'use client'
import Grid from '@mui/material/Grid';
import SubUserPermission from '@/utils/SubUserPermission';
import ContentTable from './ContentTable';

const Content = () => {
    const { contentPermission } = SubUserPermission();
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <ContentTable contentPermission={contentPermission} />
            </Grid>
        </Grid>
    )
}

export default Content
