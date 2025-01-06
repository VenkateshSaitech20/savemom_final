'use client'
import { useEffect, useState } from 'react'
import { useSettings } from '@core/hooks/useSettings'
import BannerSection from './BannerSection'
import PropTypes from "prop-types";
import apiClient from '@/utils/apiClient'
import { useParams } from 'next/navigation'
import './blog-style.css'
import { Box, Container, Grid, Typography } from '@mui/material';
import Loader from '@/components/loader';

const BlogDetail = ({ mode }) => {
    const { updatePageSettings } = useSettings();
    const { slug } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [blogDetail, setBlogDetail] = useState('');

    const getBlogDetail = async () => {
        setIsLoading(true);
        const response = await apiClient.post('api/content-management/content/get-by-slug', { slug });
        if (response?.data?.result === true) {
            setIsLoading(false);
            setBlogDetail(response?.data?.message);
        }
        setIsLoading(false);
    }

    useEffect(() => {
        getBlogDetail();
        return updatePageSettings({
            skin: 'default'
        })
    }, [])

    return (
        <div className='bg-backgroundPaper'>
            <BannerSection mode={mode} title={blogDetail?.title} />
            <Box component="section" className='plb-[100px] bg-backgroundDefault'>
                <Container>
                    {isLoading ? <Loader /> : (
                        <Grid container spacing={4}>
                            {blogDetail && (
                                <>
                                    <Grid item xs={12} className="text-center">
                                        <img className="mb-3" src={blogDetail.image} alt={blogDetail.slug} style={{ marginInline: 'auto', inlineSize: '80%', borderRadius: '6px' }} />
                                        <Typography variant="h5" component="div" className="mb-2">{blogDetail.categoryName}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography component="div" dangerouslySetInnerHTML={{ __html: blogDetail.content }} />
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    )}
                </Container>
            </Box >
        </div>
    )
}

BlogDetail.propTypes = {
    mode: PropTypes.any,
};

export default BlogDetail
