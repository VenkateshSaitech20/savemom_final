import Grid from '@mui/material/Grid'
import TemplateDetail from '@/views/apps/voice-call/template/TemplateDetail'

const VoiceCallTemplateViewPage = async () => {
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <TemplateDetail />
            </Grid>
        </Grid>
    )
}

export default VoiceCallTemplateViewPage
