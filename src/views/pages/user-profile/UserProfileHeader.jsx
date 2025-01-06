// MUI Imports
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

const UserProfileHeader = ({ data }) => {
    const defaultImg = '/images/avatars/1.png';

    return (
        <Card>
            <CardMedia image={"/images/pages/profile-banner.png"} className='bs-[250px]' />
            <CardContent className='flex gap-6 justify-center flex-col items-center md:items-end md:flex-row !pt-0 md:justify-start'>
                <div className='flex rounded-bs-md mbs-[-40px] border-[5px] mis-[-5px] border-be-0  border-backgroundPaper bg-backgroundPaper'>
                    <img height={120} width={120} src={data?.image ? data?.image : defaultImg} className='rounded' alt='Profile Background' />
                </div>
                <div className='flex is-full justify-start self-end flex-col items-center gap-6 sm-gap-0 sm:flex-row sm:justify-between sm:items-end '>
                    <div className='flex flex-col items-center sm:items-start gap-2'>
                        <Typography variant='h4'>{data?.name}</Typography>
                        <div className='flex flex-wrap gap-6 justify-center sm:justify-normal'>
                            {/* <div className='flex items-center gap-2'>
                                {data?.designationIcon && <i className={data?.designationIcon} />}
                                <Typography className='font-medium'>{data?.designation}</Typography>
                            </div> */}
                            {data?.state &&
                                <div className='flex items-center gap-2'>
                                    <i className='bx-map' />
                                    <Typography className='font-medium'>{data?.state}{data?.country ? ', ' + data?.country : ''}</Typography>
                                </div>
                            }
                            {/* <div className='flex items-center gap-2'>
                                <i className='bx-calendar' />
                                <Typography className='font-medium'>{data?.joiningDate}</Typography>
                            </div> */}
                        </div>
                    </div>
                    {/* <Button variant='contained' className='flex gap-2'>
                        <i className='bx-user-check !text-base'></i>
                        <span>Connected</span>
                    </Button> */}
                </div>
            </CardContent>
        </Card>
    )
}

UserProfileHeader.propTypes = {
    data: PropTypes.any
}

export default UserProfileHeader
