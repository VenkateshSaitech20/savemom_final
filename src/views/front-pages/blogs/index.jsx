'use client'
import { useEffect } from 'react'
import { useSettings } from '@core/hooks/useSettings'
import BannerSection from './BannerSection'
import Blog from './Blog'
import PropTypes from "prop-types";
import './blog-style.css'

const BlogPageWrapper = ({ mode }) => {
    const { updatePageSettings } = useSettings()

    useEffect(() => {
        return updatePageSettings({
            skin: 'default'
        })
    }, [])

    return (
        <div className='bg-backgroundPaper'>
            <BannerSection mode={mode} />
            <Blog />
        </div>
    )
}

BlogPageWrapper.propTypes = {
    mode: PropTypes.any,
};

export default BlogPageWrapper
