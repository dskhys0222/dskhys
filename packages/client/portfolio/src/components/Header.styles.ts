import { css } from '../../styled-system/css';

export const headerStyles = {
    header: css({
        backgroundColor: 'green.800',
        color: 'white',
        padding: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'md',
    }),
    container: css({
        maxWidth: '1200px',
        marginInline: 'auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    }),
    title: css({
        fontSize: 'xl',
        fontWeight: 'bold',
        margin: 0,
    }),
    nav: css({
        display: 'flex',
        gap: '0.5rem',
    }),
    link: css({
        color: 'white',
        textDecoration: 'none',
        padding: '0.5rem 1rem',
        borderRadius: 'md',
        fontSize: 'sm',
        transition: 'background-color 0.2s',
        _hover: {
            backgroundColor: 'green.700',
        },
    }),
    activeLink: css({
        backgroundColor: 'green.600',
    }),
};
