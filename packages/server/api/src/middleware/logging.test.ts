import express, { type Request, type Response } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loggingMiddleware } from './logging.js';

describe('Logging Middleware', () => {
    let app: ReturnType<typeof express>;
    let consoleSpy: ReturnType<typeof vi.spyOn>;
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use(loggingMiddleware);

        // テスト用のルートを追加
        app.get('/test-success', (_req: Request, res: Response) => {
            res.status(200).json({ message: 'Success' });
        });

        app.get('/test-error', (_req: Request, res: Response) => {
            res.status(400).json({ error: 'Bad Request' });
        });

        app.get('/test-not-found', (_req: Request, res: Response) => {
            res.status(404).json({ error: 'Not Found' });
        });

        app.post('/test-post', (_req: Request, res: Response) => {
            res.status(201).json({ created: true });
        });

        // スパイを設定
        consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        consoleErrorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});
    });

    describe('request logging', () => {
        it('should log incoming requests', async () => {
            await request(app).get('/test-success');

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('[API] →')
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('GET')
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('/test-success')
            );
        });

        it('should log different HTTP methods', async () => {
            await request(app).post('/test-post');

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('[API] →')
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('POST')
            );
        });

        it('should include IP address in logs', async () => {
            await request(app).get('/test-success');

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('from')
            );
        });
    });

    describe('response logging', () => {
        it('should log successful response with 200 status', async () => {
            await request(app).get('/test-success');

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('[API] ✓')
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('200')
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('ms')
            );
        });

        it('should log successful response with 201 status', async () => {
            await request(app).post('/test-post');

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('[API] ✓')
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('201')
            );
        });

        it('should log error response with 400 status', async () => {
            await request(app).get('/test-error');

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('[API] ✗')
            );
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('400')
            );
        });

        it('should log error response with 404 status', async () => {
            await request(app).get('/test-not-found');

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('[API] ✗')
            );
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('404')
            );
        });

        it('should include response time in milliseconds', async () => {
            await request(app).get('/test-success');

            const calls = consoleSpy.mock.calls.flat();
            const responseLog = calls.find((call: unknown) =>
                typeof call === 'string'
                    ? call.includes('[API] ✓') && call.includes('ms')
                    : false
            );

            expect(responseLog).toBeDefined();
            expect(typeof responseLog).toBe('string');
        });
    });

    describe('middleware behavior', () => {
        it('should call next() to pass control', async () => {
            const nextSpy = vi.fn();
            const mockReq = {
                method: 'GET',
                path: '/test',
                ip: '::1',
            } as unknown as Request;
            const mockRes = {
                send: vi.fn(function (this: Response, _data) {
                    return this;
                }),
            } as unknown as Response;

            loggingMiddleware(mockReq, mockRes, nextSpy);

            expect(nextSpy).toHaveBeenCalled();
        });

        it('should not modify request/response data', async () => {
            const response = await request(app)
                .get('/test-success')
                .expect(200);

            expect(response.body).toEqual({ message: 'Success' });
        });

        it('should handle multiple sequential requests', async () => {
            await request(app).get('/test-success');
            await request(app).post('/test-post');
            await request(app).get('/test-error');

            // 各リクエストが記録されている
            const allLogs = [
                ...consoleSpy.mock.calls,
                ...consoleErrorSpy.mock.calls,
            ].flat();

            const successLogs = allLogs.filter((log) =>
                typeof log === 'string'
                    ? log.includes('→') || log.includes('✓')
                    : false
            );

            expect(successLogs.length).toBeGreaterThanOrEqual(3);
        });
    });
});
