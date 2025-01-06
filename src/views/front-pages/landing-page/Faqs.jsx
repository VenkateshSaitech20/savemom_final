import { useEffect, useRef, useState } from 'react';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import classnames from 'classnames';
import { useIntersection } from '@/hooks/useIntersection';
import frontCommonStyles from '@views/front-pages/styles.module.css';
import styles from './styles.module.css';
import apiClient from '@/utils/apiClient';
import Loader from '@/components/loader';
import PropTypes from "prop-types";

const Faqs = ({ data }) => {
    const skipIntersection = useRef(true);
    const ref = useRef(null);
    const { updateIntersections } = useIntersection();
    const [question, setQuestion] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const getQuestion = async () => {
        setIsLoading(true);
        const response = await apiClient.get(`/api/website-settings/faq/question`);
        if (response?.data?.result === true) {
            if (response.data.message) {
                setQuestion(response.data.message);
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
        getQuestion();
    }, [])

    return (
        <>
            {isLoading && <Loader />}
            {!isLoading && (
                <section id='faq' ref={ref} className={classnames('plb-[100px] bg-backgroundDefault', styles.sectionStartRadius)}>
                    <div className={classnames('flex flex-col gap-16', frontCommonStyles.layoutSpacing)}>
                        <div className='flex flex-col items-center justify-center gap-4'>
                            <Chip size='small' variant='tonal' color='primary' label={data?.badgeTitle} />
                            <div className='flex flex-wrap flex-col items-center justify-center gap-1 text-center'>
                                <Typography variant='h4'>
                                    <span className='relative z-[1] font-extrabold'>
                                        <img
                                            src='/images/front-pages/landing-page/bg-shape.png'
                                            alt='bg-shape'
                                            className='absolute block-end-0 z-[1] bs-[40%] is-[132%] -inline-start-[8%] block-start-[17px]'
                                        />
                                        {data?.title}
                                    </span>
                                </Typography>
                                <Typography>{data?.description}</Typography>
                            </div>
                        </div>
                        <div>
                            <Grid container spacing={6}>
                                <Grid item xs={12} lg={5} className='text-center'>
                                    <img
                                        src='/images/front-pages/landing-page/boy-sitting-with-laptop.png'
                                        alt='boy with laptop'
                                        className='is-[80%] max-is-[320px]'
                                    />
                                </Grid>
                                <Grid item xs={12} lg={7}>
                                    <div>
                                        {question?.map((data) => {
                                            return (
                                                // <Accordion key={data?.id} defaultExpanded={data?.active}>
                                                <Accordion key={data?.id}>
                                                    <AccordionSummary
                                                        aria-controls={data.id + '-content'}
                                                        id={data.id + '-header'}
                                                        className='font-medium'
                                                    >
                                                        {data?.question}
                                                    </AccordionSummary>
                                                    <AccordionDetails>{data?.answer}</AccordionDetails>
                                                </Accordion>
                                            )
                                        })}
                                    </div>
                                </Grid>
                            </Grid>
                        </div>
                    </div>
                </section>
            )
            }
        </>
    )
}

Faqs.propTypes = {
    data: PropTypes.any,
};
export default Faqs
