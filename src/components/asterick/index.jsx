import React from 'react';
import { InputLabel } from '@mui/material';
import { styled } from '@mui/material/styles';
import PropTypes from "prop-types";

const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
    marginBottom: -2,
    '& .required': {
        color: theme.palette.error.main,
    },
}));

const CustomInputLabel = ({ htmlFor, text }) => {
    return (
        <StyledInputLabel className='mb-0' htmlFor={htmlFor} shrink>
            <span >
                {text} <span className="required"> *</span>
            </span>
        </StyledInputLabel>
    );
};

CustomInputLabel.propTypes = {
    htmlFor: PropTypes.string,
    text: PropTypes.string,
};

export default CustomInputLabel;
