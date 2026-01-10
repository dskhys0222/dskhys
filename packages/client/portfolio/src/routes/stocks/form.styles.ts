import { css } from '../../../styled-system/css';

export const formStyles = {
    page: css({
        maxWidth: '600px',
        marginInline: 'auto',
    }),
    title: css({
        fontSize: 'xl',
        fontWeight: 'bold',
        color: 'gray.800',
        marginBottom: '1.5rem',
    }),
    form: css({
        backgroundColor: 'white',
        borderRadius: 'lg',
        padding: '1.5rem',
        boxShadow: 'sm',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    }),
    section: css({
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    }),
    sectionTitle: css({
        fontSize: 'md',
        fontWeight: 'semibold',
        color: 'gray.700',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid',
        borderColor: 'gray.200',
        marginTop: '0.5rem',
    }),
    fieldGroup: css({
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '1rem',
        sm: {
            gridTemplateColumns: 'repeat(2, 1fr)',
        },
    }),
    field: css({
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    }),
    label: css({
        fontSize: 'sm',
        fontWeight: 'medium',
        color: 'gray.700',
    }),
    required: css({
        color: 'red.500',
        marginLeft: '0.25rem',
    }),
    input: css({
        padding: '0.5rem 0.75rem',
        borderRadius: 'md',
        border: '1px solid',
        borderColor: 'gray.300',
        fontSize: 'sm',
        _focus: {
            outline: 'none',
            borderColor: 'green.500',
            boxShadow: '0 0 0 1px var(--colors-green-500)',
        },
    }),
    inputError: css({
        borderColor: 'red.500',
        _focus: {
            borderColor: 'red.500',
            boxShadow: '0 0 0 1px var(--colors-red-500)',
        },
    }),
    select: css({
        padding: '0.5rem 0.75rem',
        borderRadius: 'md',
        border: '1px solid',
        borderColor: 'gray.300',
        fontSize: 'sm',
        backgroundColor: 'white',
        _focus: {
            outline: 'none',
            borderColor: 'green.500',
            boxShadow: '0 0 0 1px var(--colors-green-500)',
        },
    }),
    textarea: css({
        padding: '0.5rem 0.75rem',
        borderRadius: 'md',
        border: '1px solid',
        borderColor: 'gray.300',
        fontSize: 'sm',
        resize: 'vertical',
        minHeight: '80px',
        _focus: {
            outline: 'none',
            borderColor: 'green.500',
            boxShadow: '0 0 0 1px var(--colors-green-500)',
        },
    }),
    error: css({
        fontSize: 'xs',
        color: 'red.500',
    }),
    buttons: css({
        display: 'flex',
        gap: '0.75rem',
        justifyContent: 'flex-end',
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid',
        borderColor: 'gray.200',
    }),
    submitButton: css({
        backgroundColor: 'green.600',
        color: 'white',
        padding: '0.5rem 1.5rem',
        borderRadius: 'md',
        border: 'none',
        fontWeight: 'medium',
        fontSize: 'sm',
        cursor: 'pointer',
        _hover: {
            backgroundColor: 'green.700',
        },
        _disabled: {
            backgroundColor: 'gray.400',
            cursor: 'not-allowed',
        },
    }),
    cancelButton: css({
        backgroundColor: 'gray.100',
        color: 'gray.700',
        padding: '0.5rem 1.5rem',
        borderRadius: 'md',
        border: 'none',
        fontWeight: 'medium',
        fontSize: 'sm',
        cursor: 'pointer',
        textDecoration: 'none',
        _hover: {
            backgroundColor: 'gray.200',
        },
    }),
};
