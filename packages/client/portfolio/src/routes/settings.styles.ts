import { css } from '../../styled-system/css';

export const settingsStyles = {
    page: css({
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        maxWidth: '800px',
        marginInline: 'auto',
    }),
    title: css({
        fontSize: 'xl',
        fontWeight: 'bold',
        color: 'gray.800',
        margin: 0,
    }),
    section: css({
        backgroundColor: 'white',
        borderRadius: 'lg',
        padding: '1.5rem',
        boxShadow: 'sm',
    }),
    sectionTitle: css({
        fontSize: 'lg',
        fontWeight: 'semibold',
        color: 'gray.800',
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid',
        borderColor: 'gray.200',
    }),
    sectionDescription: css({
        fontSize: 'sm',
        color: 'gray.600',
        marginBottom: '1rem',
    }),
    buttonGroup: css({
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        sm: {
            flexDirection: 'row',
        },
    }),
    button: css({
        padding: '0.75rem 1.5rem',
        borderRadius: 'md',
        border: 'none',
        fontWeight: 'medium',
        fontSize: 'sm',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'background-color 0.2s',
    }),
    exportButton: css({
        backgroundColor: 'blue.600',
        color: 'white',
        _hover: {
            backgroundColor: 'blue.700',
        },
    }),
    importButton: css({
        backgroundColor: 'green.600',
        color: 'white',
        _hover: {
            backgroundColor: 'green.700',
        },
    }),
    dangerButton: css({
        backgroundColor: 'red.600',
        color: 'white',
        _hover: {
            backgroundColor: 'red.700',
        },
    }),
    fileInput: css({
        display: 'none',
    }),
    info: css({
        fontSize: 'sm',
        color: 'gray.600',
        padding: '1rem',
        backgroundColor: 'gray.50',
        borderRadius: 'md',
        marginTop: '1rem',
    }),
    infoLabel: css({
        fontWeight: 'medium',
        color: 'gray.700',
    }),
    successMessage: css({
        backgroundColor: 'green.50',
        color: 'green.700',
        padding: '0.75rem 1rem',
        borderRadius: 'md',
        fontSize: 'sm',
        marginTop: '1rem',
    }),
    errorMessage: css({
        backgroundColor: 'red.50',
        color: 'red.700',
        padding: '0.75rem 1rem',
        borderRadius: 'md',
        fontSize: 'sm',
        marginTop: '1rem',
    }),
};
