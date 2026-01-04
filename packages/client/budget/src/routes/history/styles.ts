import { css, cva } from '../../../styled-system/css';

export const styles = {
    container: css({
        display: 'flex',
        flexDirection: 'column',
        gap: '4',
        minWidth: 0,
        p: '4',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'gray.200',
        borderRadius: 'md',
        bg: 'white',
    }),

    header: css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '3',
    }),

    title: css({
        fontSize: 'lg',
        fontWeight: 'bold',
        color: 'gray.900',
    }),

    subtitle: css({
        fontSize: 'sm',
        fontWeight: 'medium',
        color: 'gray.700',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        minWidth: 0,
    }),

    backButton: cva({
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
            _focusVisible: {
                outline: '2px solid',
                outlineColor: 'blue.500',
                outlineOffset: '2px',
            },
        },
        variants: {
            intent: {
                default: {
                    bg: 'white',
                    borderColor: 'gray.200',
                    color: 'gray.800',
                    _hover: { bg: 'gray.50' },
                    _active: { bg: 'gray.100' },
                },
            },
        },
        defaultVariants: {
            intent: 'default',
        },
    }),

    list: css({
        display: 'flex',
        flexDirection: 'column',
        gap: '2',
    }),

    empty: css({
        fontSize: 'sm',
        color: 'gray.700',
    }),

    entry: css({
        display: 'flex',
        flexDirection: 'column',
        gap: '1',
        p: '3',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'gray.200',
        borderRadius: 'md',
        bg: 'gray.50',
    }),

    entryTopRow: css({
        display: 'flex',
        justifyContent: 'space-between',
        gap: '3',
        minWidth: 0,
    }),

    entryAt: css({
        fontSize: 'xs',
        color: 'gray.700',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        minWidth: 0,
    }),

    entryDelta: css({
        fontSize: 'sm',
        fontWeight: 'semibold',
        color: 'gray.900',
        flexShrink: 0,
        fontVariantNumeric: 'tabular-nums',
    }),

    entryAfter: css({
        fontSize: 'sm',
        color: 'gray.900',
        fontVariantNumeric: 'tabular-nums',
    }),
} as const;
