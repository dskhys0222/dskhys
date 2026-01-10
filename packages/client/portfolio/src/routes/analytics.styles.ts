import { css } from '../../styled-system/css';

export const analyticsStyles = {
    page: css({
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    }),
    title: css({
        fontSize: 'xl',
        fontWeight: 'bold',
        color: 'gray.800',
        margin: 0,
    }),
    chartsGrid: css({
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '1rem',
        md: {
            gridTemplateColumns: 'repeat(2, 1fr)',
        },
    }),
    chartCard: css({
        backgroundColor: 'white',
        borderRadius: 'lg',
        padding: '1rem',
        boxShadow: 'sm',
    }),
    chartTitle: css({
        fontSize: 'md',
        fontWeight: 'semibold',
        marginBottom: '1rem',
        color: 'gray.800',
    }),
    chartContainer: css({
        height: '280px',
    }),
    tablesSection: css({
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    }),
    tableCard: css({
        backgroundColor: 'white',
        borderRadius: 'lg',
        padding: '1rem',
        boxShadow: 'sm',
        overflowX: 'auto',
    }),
    tableTitle: css({
        fontSize: 'md',
        fontWeight: 'semibold',
        marginBottom: '1rem',
        color: 'gray.800',
    }),
    table: css({
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 'sm',
    }),
    th: css({
        padding: '0.5rem 0.75rem',
        textAlign: 'left',
        backgroundColor: 'gray.100',
        fontWeight: 'semibold',
        color: 'gray.700',
        whiteSpace: 'nowrap',
        borderBottom: '1px solid',
        borderColor: 'gray.200',
    }),
    thRight: css({
        textAlign: 'right',
    }),
    td: css({
        padding: '0.5rem 0.75rem',
        borderBottom: '1px solid',
        borderColor: 'gray.100',
        whiteSpace: 'nowrap',
    }),
    tdRight: css({
        textAlign: 'right',
    }),
    positive: css({
        color: 'green.600',
    }),
    negative: css({
        color: 'red.600',
    }),
    emptyState: css({
        textAlign: 'center',
        padding: '3rem',
        color: 'gray.500',
    }),
};
