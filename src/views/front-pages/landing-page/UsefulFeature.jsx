import { useEffect, useRef, useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import classnames from 'classnames';
import { useIntersection } from '@/hooks/useIntersection';
import frontCommonStyles from '@views/front-pages/styles.module.css';
import apiClient from '@/utils/apiClient';
import Loader from '@/components/loader';
import PropTypes from "prop-types";

const UsefulFeature = ({ data }) => {
  const skipIntersection = useRef(true);
  const ref = useRef(null);
  const { updateIntersections } = useIntersection();
  const [isLoading, setIsLoading] = useState(false);
  const [features, setFeatures] = useState();
  const getSecondSection = async () => {
    setIsLoading(true);
    const response = await apiClient.get(`/api/website-settings/second-section`);
    if (response.data.result === true) {
      if (response.data.message) {
        setFeatures(response.data.message);
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
    getSecondSection();
  }, [])

  return (
    <>
      {isLoading && <Loader />}
      {
        !isLoading && (
          <section id='features' ref={ref}>
            <div className={classnames('flex flex-col gap-12 plb-[100px]', frontCommonStyles.layoutSpacing)}>
              <div className='flex flex-col items-center justify-center gap-4'>
                <Chip size='small' variant='tonal' color='primary' label={data?.badgeTitle} />
                <div className='flex flex-wrap flex-col items-center justify-center gap-1 text-center'>
                  <Typography variant='h4'>
                    <span className='relative z-[1] font-extrabold'>
                      {data?.title}
                      <img
                        src='/images/front-pages/landing-page/bg-shape.png'
                        alt='bg-shape'
                        className='absolute block-end-0 z-[1] bs-[40%] is-[125%] sm:is-[132%] -inline-start-[13%] sm:inline-start-[-19%] block-start-[17px]'
                      />
                    </span>
                  </Typography>
                  <Typography>{data?.description}</Typography>
                </div>
              </div>
              <div>
                <Grid container spacing={6} rowGap={6}>
                  {features?.map((item) => (
                    <Grid item xs={12} sm={6} lg={4} key={item.id}>
                      <div className='flex flex-col items-center justify-center'>
                        {item.image && (<img height={60} width={60} src={item.image} alt="icon" />)}
                        <Typography variant='h5' className='mbs-4'>
                          {item.title}
                        </Typography>
                        <Typography className='max-is-[364px] mbs-2 text-center'>{item.description}</Typography>
                      </div>
                    </Grid>
                  ))}
                </Grid>
              </div>
            </div>
          </section>
        )
      }

    </>
  )
}
UsefulFeature.propTypes = {
  data: PropTypes.any,
};
export default UsefulFeature
