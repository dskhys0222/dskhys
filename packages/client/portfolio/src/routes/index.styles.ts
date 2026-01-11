import { css } from '../../styled-system/css';

export const indexStyles = {
    page: css({
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    }),
    header: css({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
    }),
    title: css({
        fontSize: 'xl',
        fontWeight: 'bold',
        color: 'gray.800',
        margin: 0,
    }),
    addButton: css({
        backgroundColor: 'green.600',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: 'md',
        textDecoration: 'none',
        fontWeight: 'medium',
        fontSize: 'sm',
        _hover: {
            backgroundColor: 'green.700',
        },
    }),
    filters: css({
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
    }),
    filterSelect: css({
        padding: '0.5rem',
        borderRadius: 'md',
        border: '1px solid',
        borderColor: 'gray.300',
        fontSize: 'sm',
        backgroundColor: 'white',
    }),
    tableContainer: css({
        overflowX: 'auto',
        backgroundColor: 'white',
        borderRadius: 'lg',
        boxShadow: 'sm',
    }),
    table: css({
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 'sm',
    }),
    th: css({
        padding: '0.75rem',
        textAlign: 'left',
        backgroundColor: 'gray.100',
        fontWeight: 'semibold',
        color: 'gray.700',
        whiteSpace: 'nowrap',
        borderBottom: '1px solid',
        borderColor: 'gray.200',
    }),
    td: css({
        padding: '0.75rem',
        borderBottom: '1px solid',
        borderColor: 'gray.100',
        whiteSpace: 'nowrap',
    }),
    ticker: css({
        fontWeight: 'bold',
        color: 'green.700',
    }),
    actionButton: css({
        padding: '0.25rem 0.5rem',
        borderRadius: 'sm',
        border: 'none',
        cursor: 'pointer',
        fontSize: 'xs',
        marginRight: '0.25rem',
    }),
    editButton: css({
        backgroundColor: 'blue.100',
        color: 'blue.700',
        _hover: {
            backgroundColor: 'blue.200',
        },
    }),
    deleteButton: css({
        backgroundColor: 'red.100',
        color: 'red.700',
        _hover: {
            backgroundColor: 'red.200',
        },
    }),
    emptyState: css({
        textAlign: 'center',
        padding: '3rem',
        color: 'gray.500',
    }),
    mobileCard: css({
        display: 'block',
        md: {
            display: 'none',
        },
    }),
    desktopTable: css({
        display: 'none',
        md: {
            display: 'block',
        },
    }),
    cardList: css({
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    }),
    card: css({
        backgroundColor: 'white',
        borderRadius: 'lg',
        padding: '0.5rem 1rem',
        boxShadow: 'sm',
    }),
    cardHeader: css({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    }),
    cardTicker: css({
        fontWeight: 'bold',
        color: 'green.700',
        fontSize: 'lg',
    }),
    cardName: css({
        fontSize: 'xs',
        color: 'gray.600',
    }),
    cardBody: css({
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.5rem',
        color: 'gray.400',
        fontSize: 'xs',
    }),
    swipeContainer: css({
        position: 'relative',
        overflow: 'hidden',
    }),
    deleteBackground: css({
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100px',
        backgroundColor: 'red.600',
        borderRadius: 'xl',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '2rem',
    }),
    cardValueAmount: css({
        fontWeight: '600',
        fontSize: '1rem',
    }),
};
