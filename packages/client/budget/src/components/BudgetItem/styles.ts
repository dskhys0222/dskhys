import { css, cva } from '../../../styled-system/css';

export const styles = {
    container: css({
        display: 'flex',
        flexDirection: 'column',
        gap: '3',
        minWidth: 0,
        p: '4',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'gray.200',
        borderRadius: 'md',
        bg: 'white',
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
                    bg: 'blue.50',
                    borderColor: 'blue.200',
                    color: 'blue.800',
                    _hover: { bg: 'blue.100' },
                    _active: { bg: 'blue.200' },
                },
                decrease: {
                    bg: 'gray.50',
                    borderColor: 'gray.200',
                    color: 'gray.800',
                    _hover: { bg: 'gray.100' },
                    _active: { bg: 'gray.200' },
                },
                history: {
                    bg: 'white',
                    borderColor: 'gray.200',
                    color: 'gray.800',
                    fontSize: 'sm',
                    px: '2',
                    width: 'auto',
                    _hover: { bg: 'gray.50' },
                    _active: { bg: 'gray.100' },
                },
            },
        },
    }),

    dialogOverlay: css({
        position: 'fixed',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        p: '4',
        bg: 'blackAlpha.500',
        zIndex: 50,
    }),

    dialog: css({
        width: 'full',
        maxWidth: 'sm',
        borderRadius: 'md',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'gray.200',
        bg: 'white',
        p: '4',
    }),

    dialogTitle: css({
        fontSize: 'md',
        fontWeight: 'bold',
        color: 'gray.900',
        mb: '3',
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
        px: '3',
        py: '2',
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
            px: '4',
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
                    bg: 'white',
                    borderColor: 'gray.200',
                    color: 'gray.800',
                    _hover: { bg: 'gray.50' },
                    _active: { bg: 'gray.100' },
                },
                primary: {
                    bg: 'blue.600',
                    borderColor: 'blue.700',
                    color: 'white',
                    _hover: { bg: 'blue.700' },
                    _active: { bg: 'blue.800' },
                },
            },
        },
        defaultVariants: {
            intent: 'ghost',
        },
    }),
} as const;
