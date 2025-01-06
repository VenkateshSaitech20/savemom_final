import Grid from '@mui/material/Grid'
import WhatsAppTemplateDetail from '@/views/apps/whats-app/template/WhatsAppTemplateDetail'

const WhatsAppTemplateViewPage = async () => {
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <WhatsAppTemplateDetail />
            </Grid>
        </Grid>
    )
}

export default WhatsAppTemplateViewPage
