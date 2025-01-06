// MUI Imports
import Grid from '@mui/material/Grid'

// Components Imports
import VerticalWithHeader from '@components/card-statistics/VerticalWithHeader'

const VerticalStatisticsCardWithHeader = ({ data }) => {
  return (
    data && (
      <Grid container spacing={6}>
        {data.map((item, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <VerticalWithHeader {...item} />
          </Grid>
        ))}
      </Grid>
    )
  )
}

export default VerticalStatisticsCardWithHeader
