import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Rating from '@mui/material/Rating';
import Divider from '@mui/material/Divider';
import { useKeenSlider } from 'keen-slider/react';
import classnames from 'classnames';
import CustomIconButton from '@core/components/mui/IconButton';
import AppKeenSlider from '@/libs/styles/AppKeenSlider';
import frontCommonStyles from '@views/front-pages/styles.module.css';
import { useCallback, useEffect, useState } from 'react';
import apiClient from '@/utils/apiClient';
import Loader from '@/components/loader';
import PropTypes from "prop-types";

const CustomerReviews = ({ data, brand }) => {
  const [testimonialReviews, setTestimonialReviews] = useState([{}]);
  const [isLoading, setIsLoading] = useState(false);
  const [sliderReady, setSliderReady] = useState(false);
  const [brandImages, setBrandImages] = useState([]);

  const gettestimonialReviewsData = useCallback(async () => {
    setIsLoading(true);
    const response = await apiClient.get('/api/website-settings/testimonial/review');
    if (response?.data?.result) {
      setTestimonialReviews(response.data.message);
    }
    setIsLoading(false);
  }, []);

  const getBrandSection = async () => {
    setIsLoading(true);
    const response = await apiClient.get(`/api/website-settings/brand`);
    if (response?.data?.result === true) {
      if (response?.data?.message) {
        setBrandImages(response?.data?.message);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    gettestimonialReviewsData();
    getBrandSection();
  }, []);

  const [sliderRef, instanceRef] = useKeenSlider(
    {
      loop: true,
      slides: {
        perView: 3,
        origin: 'auto'
      },
      breakpoints: {
        '(max-width: 1200px)': {
          slides: {
            perView: 2,
            spacing: 10,
            origin: 'auto'
          }
        },
        '(max-width: 900px)': {
          slides: {
            perView: 2,
            spacing: 10
          }
        },
        '(max-width: 600px)': {
          slides: {
            perView: 1,
            spacing: 10,
            origin: 'center'
          }
        }
      }
    },
    [
      slider => {
        let timeout
        const mouseOver = false

        function clearNextTimeout() {
          clearTimeout(timeout)
        }

        function nextTimeout() {
          clearTimeout(timeout);
          if (mouseOver || !slider) return;
          timeout = setTimeout(() => {
            if (slider) slider.next();
          }, 2000);
        }

        slider?.on('created', () => {
          if (slider) {
            setSliderReady(true);
            nextTimeout();
          }
        });
        slider?.on('dragStarted', clearNextTimeout)
        slider?.on('animationEnded', nextTimeout)
        slider?.on('updated', nextTimeout)
      }
    ]
  )

  return (
    <>
      {(isLoading) && <Loader />}
      {data?.isfrontendvisible === "Y" && (
        <section
          className={classnames('flex flex-col pbs-[88px] pbe-[50px] bg-backgroundDefault')}
          style={{
            paddingBottom: brand?.isfrontendvisible === "N" ? '100px' : ''
          }}
        >
          <div
            className={classnames('flex max-md:flex-col max-sm:flex-wrap is-full gap-6', frontCommonStyles.layoutSpacing)}
          >
            <div className='flex flex-col items-center lg:items-start justify-center bs-full is-full md:is-[30%] mlb-auto'>
              <Chip label={data?.badgeTitle} variant='tonal' color='primary' size='small' className='mbe-4' />
              <div className='flex flex-wrap flex-col gap-1 max-lg:text-center'>
                <Typography variant='h4'>
                  <span className='relative z-[1] font-extrabold'>
                    {data?.title}
                    <img
                      src='/images/front-pages/landing-page/bg-shape.png'
                      alt='bg-shape'
                      className='absolute block-end-0 z-[1] bs-[40%] is-[132%] inline-start-[-8%] block-start-[17px]'
                    />
                  </span>
                </Typography>
                <Typography>{data?.description}</Typography>
              </div>
              <div className='flex gap-4 mbs-12'>
                <CustomIconButton color='primary' variant='tonal' onClick={() => instanceRef.current && sliderReady && instanceRef.current.prev()}>
                  <i className='bx-chevron-left' />
                </CustomIconButton>
                <CustomIconButton color='primary' variant='tonal' onClick={() => instanceRef.current && sliderReady && instanceRef.current.next()}>
                  <i className='bx-chevron-right' />
                </CustomIconButton>
              </div>
            </div>
            <div className='is-full md:is-[70%]'>
              <AppKeenSlider>
                <div ref={sliderRef} className='keen-slider'>
                  {testimonialReviews?.map((item) => (
                    <div key={`${item.id}}`} className='keen-slider__slide flex p-4 sm:p-3'>
                      <Card className='flex'>
                        <CardContent className='p-6 mlb-auto'>
                          <div className='flex flex-col gap-4 items-start'>
                            {item.image && (<img src={item.image} alt="company-logo" className='w-[100px] h-[30px]' />)}
                            <Typography>{item.description}</Typography>
                            <Rating value={item.rating} readOnly />
                            <div className='flex items-center gap-3'>
                              {/* <CustomAvatar size={32} src={defaultImg} alt={item.postedBy} /> */}
                              <div className='flex flex-col items-start'>
                                <Typography variant='h6'>{item.postedBy}</Typography>
                                <Typography variant='body2' color='text.disabled'>
                                  {item.designation}
                                </Typography>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </AppKeenSlider>
            </div>
          </div>
        </section>
      )}
      {brand?.isfrontendvisible === "Y" && (
        <section
          className={classnames('flex flex-col pbe-[100px] bg-backgroundDefault')}
          style={{
            paddingTop: data?.isfrontendvisible === "N" ? '100px' : ''
          }}
        >
          {data?.isfrontendvisible === "Y" && (<Divider className=' mbe-8' />)}
          <div className='flex flex-wrap items-center justify-center gap-x-16 gap-y-6 mli-3'>
            {brandImages?.map((item) => (
              <img src={item.image} key={item.id} alt='Brand' className='w-[100px] h-[30px]' style={{ color: 'var(--mui-palette-text-secondary)' }} />
            ))}
          </div>
        </section >
      )}
    </>

  )
}
CustomerReviews.propTypes = {
  data: PropTypes.any,
  brand: PropTypes.any,
};

export default CustomerReviews
