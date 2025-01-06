'use client';
import PropTypes from 'prop-types';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerDoc = ({ spec }) => (
    <SwaggerUI spec={spec} />
);

SwaggerDoc.propTypes = {
    /**
     * OpenApi specifications
     */
    spec: PropTypes.oneOfType([PropTypes.object]).isRequired,
};

export default SwaggerDoc;
