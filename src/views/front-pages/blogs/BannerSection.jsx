import Typography from '@mui/material/Typography';
import classnames from 'classnames';
import { useImageVariant } from '@core/hooks/useImageVariant';
import frontCommonStyles from '@views/front-pages/styles.module.css';
import PropTypes from 'prop-types';

const BannerSection = ({ mode, title }) => {
    const getStartedImageLight = '/images/front-pages/landing-page/get-started-bg-light.png'
    const getStartedImageDark = '/images/front-pages/landing-page/get-started-bg-dark.png'
    const getStartedImage = useImageVariant(mode, getStartedImageLight, getStartedImageDark)

    return (
        <section className='blogBanner'>
            <img src={getStartedImage} alt='background-image' className='absolute is-full flex -z-1 pointer-events-none bs-full block-end-0' />
            <div className={classnames('flex items-center justify-center w-full', frontCommonStyles.layoutSpacing)}>
                <div className='w-full lg:w-1/1 flex flex-col items-center text-center gap-8 z-[1]'>
                    <div className='w-full lg:w-1/1 flex flex-col items-center text-center gap-y-8 z-[1]'>
                        <div className='flex flex-col gap-1'>
                            <Typography variant='h3' color='primary' className='font-bold text-[2.125rem] leading-[44px]'>{title ? title : 'Blogs'}</Typography>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

BannerSection.propTypes = {
    mode: PropTypes.any,
    title: PropTypes.string
}

export default BannerSection
