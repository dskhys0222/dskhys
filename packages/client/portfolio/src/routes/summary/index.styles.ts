import { css } from '../../../styled-system/css';

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
    sectionHeader: css({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
    }),
    sectionTitle: css({
        fontSize: 'md',
        fontWeight: 'semibold',
        color: 'gray.700',
    }),
    customChartContainer: css({
        position: 'relative',
    }),
    deleteButton: css({
        position: 'absolute',
        top: '0.5rem',
        right: '0.5rem',
        padding: '0.25rem 0.5rem',
        backgroundColor: 'red.100',
        color: 'red.700',
        border: 'none',
        borderRadius: 'sm',
        fontSize: 'xs',
        cursor: 'pointer',
        zIndex: 10,
        _hover: {
            backgroundColor: 'red.200',
        },
    }),
    editButton: css({
        position: 'absolute',
        top: '0.5rem',
        right: '3rem',
        padding: '0.25rem 0.5rem',
        backgroundColor: 'blue.100',
        color: 'blue.700',
        border: 'none',
        borderRadius: 'sm',
        fontSize: 'xs',
        cursor: 'pointer',
        zIndex: 10,
        _hover: {
            backgroundColor: 'blue.200',
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
    addCustomButton: css({
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        backgroundColor: 'green.600',
        color: 'white',
        borderRadius: 'md',
        textDecoration: 'none',
        fontWeight: 'medium',
        fontSize: 'sm',
        _hover: {
            backgroundColor: 'green.700',
        },
    }),
    addButtonContainer: css({
        display: 'flex',
        justifyContent: 'center',
    }),
};
