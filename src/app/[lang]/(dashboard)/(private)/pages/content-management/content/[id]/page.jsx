import ContentDetail from '@/views/pages/content-management/content/ContentDetail';
import Grid from '@mui/material/Grid';

const ContentViewTab = async () => {
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <ContentDetail />
            </Grid>
        </Grid>
    )
}

export default ContentViewTab
