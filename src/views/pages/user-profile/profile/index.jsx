import Grid from '@mui/material/Grid'
import AboutOverview from './AboutOverview'
// import ActivityTimeline from './ActivityTimeline'
// import ConnectionsTeams from './ConnectionsTeams'
// import ProjectsTable from './ProjectsTables'
import PropTypes from "prop-types";

const ProfileTab = ({ data }) => {
  return (
    <Grid container spacing={6}>
      <Grid item lg={12} md={12} xs={12}>
        <AboutOverview data={data} />
      </Grid>
      {/* <Grid item lg={8} md={7} xs={12}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <ActivityTimeline />
          </Grid>
          <ConnectionsTeams connections={data?.connections} teamsTech={data?.teamsTech} />
          <Grid item xs={12}>
            <ProjectsTable projectTable={data?.projectTable} />
          </Grid>
        </Grid>
      </Grid> */}
    </Grid>
  )
}

ProfileTab.propTypes = {
  data: PropTypes.any,
};
export default ProfileTab
