import { css, cva } from '../../../styled-system/css';

export const styles = {
    container: css({
        display: 'flex',
        flexDirection: 'column',
        gap: '3',
        minWidth: 0,
        padding: '4',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'gray.200',
        borderRadius: 'md',
        backgroundColor: 'white',
    }),

    headerRow: css({
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: '3',
    }),

    name: css({
        fontSize: 'sm',
        fontWeight: 'semibold',
        color: 'gray.800',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        minWidth: 0,
    }),

    amount: css({
        fontSize: 'lg',
        fontWeight: 'bold',
        color: 'gray.900',
        textAlign: 'right',
        flexShrink: 0,
        fontVariantNumeric: 'tabular-nums',
    }),

    actions: css({
        display: 'flex',
        gap: '2',
    }),

    actionButton: cva({
        base: {
            appearance: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '9',
            height: '9',
            borderRadius: 'md',
            borderWidth: '1px',
            borderStyle: 'solid',
            fontSize: 'lg',
            lineHeight: '1',
            fontWeight: 'semibold',
            cursor: 'pointer',
            userSelect: 'none',
            transitionProperty: 'background, border-color',
            transitionDuration: 'fast',
            _focusVisible: {
                outline: '2px solid',
                outlineColor: 'blue.500',
                outlineOffset: '2px',
            },
        },
        variants: {
            kind: {
                increase: {
                    backgroundColor: 'blue.50',
                    borderColor: 'blue.200',
                    color: 'blue.800',
                    _hover: { backgroundColor: 'blue.100' },
                    _active: { backgroundColor: 'blue.200' },
                },
                decrease: {
                    backgroundColor: 'gray.50',
                    borderColor: 'gray.200',
                    color: 'gray.800',
                    _hover: { backgroundColor: 'gray.100' },
                    _active: { backgroundColor: 'gray.200' },
                },
                history: {
                    backgroundColor: 'white',
                    borderColor: 'gray.200',
                    color: 'gray.800',
                    fontSize: 'sm',
                    paddingInline: '2',
                    width: 'auto',
                    _hover: { backgroundColor: 'gray.50' },
                    _active: { backgroundColor: 'gray.100' },
                },
            },
        },
    }),

    dialogOverlay: css({
        position: 'fixed',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        padding: '4',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 50,
        overflow: 'auto',
    }),

    dialog: css({
        width: 'full',
        maxWidth: 'sm',
        borderRadius: 'md',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'gray.200',
        backgroundColor: 'white',
        padding: '4',
        marginBlock: 'auto',
    }),

    dialogTitle: css({
        fontSize: 'md',
        fontWeight: 'bold',
        color: 'gray.900',
        marginBottom: '3',
    }),

    form: css({
        display: 'flex',
        flexDirection: 'column',
        gap: '4',
    }),

    field: css({
        display: 'flex',
        flexDirection: 'column',
        gap: '1',
    }),

    label: css({
        fontSize: 'sm',
        fontWeight: 'medium',
        color: 'gray.800',
    }),

    input: css({
        width: 'full',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'gray.300',
        borderRadius: 'md',
        paddingInline: '3',
        paddingBlock: '2',
        fontSize: 'md',
        _focusVisible: {
            outline: '2px solid',
            outlineColor: 'blue.500',
            outlineOffset: '2px',
        },
    }),

    footer: css({
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '2',
    }),

    footerButton: cva({
        base: {
            appearance: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '9',
            paddingInline: '4',
            borderRadius: 'md',
            borderWidth: '1px',
            borderStyle: 'solid',
            fontSize: 'sm',
            fontWeight: 'semibold',
            cursor: 'pointer',
            transitionProperty: 'background, border-color',
            transitionDuration: 'fast',
            _disabled: {
                opacity: 0.5,
                cursor: 'not-allowed',
            },
            _focusVisible: {
                outline: '2px solid',
                outlineColor: 'blue.500',
                outlineOffset: '2px',
            },
        },
        variants: {
            intent: {
                ghost: {
                    backgroundColor: 'white',
                    borderColor: 'gray.200',
                    color: 'gray.800',
                    _hover: { backgroundColor: 'gray.50' },
                    _active: { backgroundColor: 'gray.100' },
                },
                primary: {
                    backgroundColor: 'blue.600',
                    borderColor: 'blue.700',
                    color: 'white',
                    _hover: { backgroundColor: 'blue.700' },
                    _active: { backgroundColor: 'blue.800' },
                },
            },
        },
        defaultVariants: {
            intent: 'ghost',
        },
    }),
} as const;
