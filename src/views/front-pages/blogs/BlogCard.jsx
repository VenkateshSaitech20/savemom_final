
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import Link from '@/components/Link';
import { isToday } from '@/utils/helper';

const BlogCard = ({ imageSrc, title, description, postedAt, slug }) => {
    return (
        <Card>
            <CardMedia component="img" alt="blog" height="180" image={imageSrc} />
            <CardContent className="pb-4">
                <Typography variant="h5" component="div" className="mb-2">
                    {title.length > 30 ? `${title.substring(0, 30)}...` : title}
                </Typography>
                <Typography className="mb-0">
                    {description.length > 150 ? `${description.substring(0, 150)}...` : description}
                </Typography>
            </CardContent>
            <CardActions className='flex justify-between'>
                <Link href={`/front-pages/blogs/${slug}`} className='no-underline text-primary'>Read more</Link>
                <Typography className='text-secondary'>
                    {isToday(new Date(postedAt))
                        ? new Intl.DateTimeFormat('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        }).format(new Date(postedAt))
                        : new Intl.DateTimeFormat('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: '2-digit'
                        }).format(new Date(postedAt))}
                </Typography>
            </CardActions>
        </Card>
    )
}

BlogCard.propTypes = {
    imageSrc: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    postedAt: PropTypes.string,
    slug: PropTypes.string
}

export default BlogCard
