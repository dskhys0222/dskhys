import { css } from '../../styled-system/css';

export const styles = {
    app: css({
        minHeight: '100dvh',
        bg: 'gray.50',
        color: 'gray.900',
    }),
    main: css({
        maxWidth: '4xl',
        mx: 'auto',
        px: { base: '4', md: '6' },
        py: { base: '4', md: '6' },
    }),
    pageStack: css({
        display: 'flex',
        flexDirection: 'column',
        gap: '4',
    }),
    addItemForm: css({
        display: 'flex',
        gap: '2',
        mb: '4',
    }),
    itemWrapperContainer: css({
        position: 'relative',
        display: 'flex',
        borderRadius: 'md',
        overflow: 'hidden',
    }),
    itemWrapperDesktop: css({
        display: 'flex',
    }),
    itemWrapperPcContainer: css({
        position: 'relative',
        display: 'flex',
        flex: 1,
        '& > :first-child': {
            flex: 1,
        },
    }),
    deleteBackground: css({
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        pr: '3',
        fontSize: 'xl',
        pointerEvents: 'none',
        zIndex: 0,
        bg: 'red.500',
        borderRadius: 'md',
    }),
    itemWrapper: css({
        display: 'flex',
        alignItems: 'flex-start',
        gap: '2',
        flex: 1,
        position: 'relative',
        zIndex: 1,
        '& > :first-child': {
            flex: 1,
            minWidth: 0,
        },
    }),
    deleteButton: css({
        position: 'absolute',
        bottom: '2',
        right: '2',
        px: '3',
        py: '2',
        bg: 'red.500',
        color: 'white',
        border: 'none',
        borderRadius: 'md',
        cursor: 'pointer',
        flexShrink: 0,
        _hover: {
            bg: 'red.600',
        },
    }),
} as const;
