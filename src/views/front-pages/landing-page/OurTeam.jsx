import { useEffect, useRef, useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';
import classnames from 'classnames';
import { useIntersection } from '@/hooks/useIntersection';
import frontCommonStyles from '@views/front-pages/styles.module.css';
import styles from './styles.module.css';
import apiClient from '@/utils/apiClient';
import Loader from '@/components/loader';
import PropTypes from "prop-types";

const Card = styled('div')`
  border-color: ${props => props.color};
  border-start-start-radius: 90px;
  border-start-end-radius: 20px;
  border-end-start-radius: 6px;
  border-end-end-radius: 6px;
`
const OurTeam = ({ data }) => {
  const skipIntersection = useRef(true);
  const ref = useRef(null);
  const { updateIntersections } = useIntersection();
  const [isLoading, setIsLoading] = useState(false);
  const [ourTeams, setOurTeams] = useState();
  const defaultImage = '/images/front-pages/landing-page/sophie.png';
  const getOurTeam = async () => {
    setIsLoading(true);
    const response = await apiClient.get(`/api/website-settings/our-team`);
    if (response.data.result === true) {
      if (response.data.message) {
        setOurTeams(response.data.message);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (skipIntersection.current) {
          skipIntersection.current = false
          return
        }
        updateIntersections({ [entry.target.id]: entry.isIntersecting })
      },
      { threshold: 0.35 }
    )
    ref.current && observer.observe(ref.current)
    getOurTeam();
  }, [])

  return (
    <>
      {isLoading && <Loader />}
      {!isLoading && (
        <section id='team' className='plb-[100px]' ref={ref}>
          <div className={frontCommonStyles.layoutSpacing}>
            <div className='flex flex-col items-center justify-center gap-4'>
              <Chip size='small' variant='tonal' color='primary' label={data?.badgeTitle} />
              <div className='flex flex-wrap flex-col items-center justify-center gap-1 text-center'>
                <Typography variant='h4'>
                  <span className='relative z-[1] font-extrabold'>
                    {data?.title}
                    <img
                      src='/images/front-pages/landing-page/bg-shape.png'
                      alt='bg-shape'
                      className='absolute block-end-0 z-[1] bs-[40%] is-[132%] -inline-start-[19%] block-start-[17px]'
                    />
                  </span>
                </Typography>
                <Typography>{data?.description}</Typography>
              </div>
            </div>
            <Grid container rowSpacing={16} columnSpacing={6} className='pbs-[100px]'>
              {ourTeams?.map((item) => (
                <Grid key={item.id} item xs={12} md={6} lg={3}>
                  <Card className='border overflow-visible' color="var(--mui-palette-primary-lightOpacity)">
                    <div className='flex flex-col items-center justify-center p-0'>
                      <div
                        className={classnames(
                          'flex justify-center is-full mli-auto text-center bs-[185px] relative overflow-visible',
                          styles.teamCard
                        )}
                        style={{ backgroundColor: "var(--mui-palette-primary-lightOpacity)" }}
                      >
                        <img
                          src={item?.image || defaultImage}
                          alt="Team"
                          className='bs-[240px] absolute block-start-[-55px]'
                        />
                      </div>
                      <div className='flex flex-col gap-3 p-4 is-full'>
                        <div className='flex flex-col gap-0.5 text-center'>
                          <Typography variant='h5'>{item?.title}</Typography>
                          <Typography color='text.disabled'>{item?.description}</Typography>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Grid>
              ))}
            </Grid>

          </div>
        </section>
      )}
    </>
  )
}

OurTeam.propTypes = {
  data: PropTypes.any,
};
export default OurTeam
