import React from 'react';
import PropTypes from "prop-types";
import styles from './loader.module.css';

const Loader = ({ size, type }) => {
    let loaderClassName;
    let loaderTypeClassName;

    // Loader Size
    if (size === "md") {
        loaderClassName = styles.mdLoader;
    } else if (size === "lg") {
        loaderClassName = styles.lgLoader;
    } else {
        loaderClassName = styles.smLoader;
    }

    // Loader Type
    if (type === "btnLoader") {
        loaderTypeClassName = styles.btnLoader;
    } else {
        loaderTypeClassName = styles.loader
    }

    return (
        <div className={`${loaderTypeClassName} ${loaderClassName}`}></div>
    );
};

Loader.propTypes = {
    size: PropTypes.string,
    type: PropTypes.string,
};

export default Loader;
