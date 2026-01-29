import { css } from '../../../styled-system/css';

export const styles = {
    header: css({
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bg: 'white',
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: 'gray.200',
    }),
    inner: css({
        maxWidth: '4xl',
        mx: 'auto',
        px: { base: '4', md: '6' },
        py: '4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    }),
    title: css({
        fontSize: 'lg',
        fontWeight: 'bold',
        color: 'gray.900',
        letterSpacing: 'tight',
    }),
    tab: css({
        color: 'gray.700',
        textDecoration: 'none',
        padding: '0.5rem 1rem',
        borderRadius: 'md',
        fontSize: 'sm',
        fontWeight: 'bold',
        transition: 'background 0.2s',
        _hover: {
            background: 'gray.100',
        },
    }),
    activeTab: css({
        background: 'blue.100',
        color: 'blue.700',
        textDecoration: 'none',
        padding: '0.5rem 1rem',
        borderRadius: 'md',
        fontSize: 'sm',
        fontWeight: 'bold',
        transition: 'background 0.2s',
    }),
} as const;
