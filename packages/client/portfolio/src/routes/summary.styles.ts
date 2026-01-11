import { css } from '../../styled-system/css';

export const summaryStyles = {
    page: css({
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    }),
    summaryGrid: css({
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
        md: {
            gridTemplateColumns: 'repeat(4, 1fr)',
        },
    }),
    summaryCard: css({
        backgroundColor: 'white',
        borderRadius: 'lg',
        padding: '1rem',
        boxShadow: 'sm',
    }),
    summaryLabel: css({
        fontSize: 'sm',
        color: 'gray.600',
        marginBottom: '0.25rem',
    }),
    summaryValue: css({
        fontSize: 'xl',
        fontWeight: 'bold',
        color: 'gray.900',
    }),
    chartsGrid: css({
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '1rem',
        md: {
            gridTemplateColumns: 'repeat(2, 1fr)',
        },
    }),
    emptyState: css({
        textAlign: 'center',
        padding: '3rem',
        color: 'gray.500',
    }),
    addButton: css({
        display: 'inline-block',
        marginTop: '1rem',
        backgroundColor: 'green.600',
        color: 'white',
        padding: '0.75rem 1.5rem',
        borderRadius: 'md',
        textDecoration: 'none',
        fontWeight: 'medium',
        _hover: {
            backgroundColor: 'green.700',
        },
    }),
};
