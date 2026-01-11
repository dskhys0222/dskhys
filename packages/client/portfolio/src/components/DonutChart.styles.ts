import { css } from '../../styled-system/css';

export const donutChartStyles = {
    container: css({
        backgroundColor: 'white',
        borderRadius: 'lg',
        padding: '1rem',
        boxShadow: 'sm',
    }),
    title: css({
        fontSize: 'md',
        fontWeight: 'semibold',
        color: 'gray.700',
        marginBottom: '0.5rem',
        textAlign: 'center',
    }),
    chartContainer: css({
        height: '180px',
    }),
    emptyState: css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
        color: 'gray.500',
        fontSize: 'sm',
    }),
    legendTable: css({
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 'sm',
        marginTop: '0.5rem',
    }),
    legendTh: css({
        padding: '0.375rem 0.5rem',
        textAlign: 'left',
        backgroundColor: 'gray.100',
        fontWeight: 'semibold',
        color: 'gray.700',
        whiteSpace: 'nowrap',
        borderBottom: '1px solid',
        borderColor: 'gray.200',
        fontSize: 'xs',
    }),
    legendThRight: css({
        textAlign: 'right',
    }),
    legendTd: css({
        padding: '0.375rem 0.5rem',
        borderBottom: '1px solid',
        borderColor: 'gray.100',
        whiteSpace: 'nowrap',
        fontSize: 'xs',
    }),
    legendTdRight: css({
        textAlign: 'right',
    }),
    colorIndicator: css({
        display: 'inline-block',
        width: '10px',
        height: '10px',
        borderRadius: '2px',
        marginRight: '0.5rem',
        verticalAlign: 'middle',
    }),
};
