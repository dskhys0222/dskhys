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
} as const;
