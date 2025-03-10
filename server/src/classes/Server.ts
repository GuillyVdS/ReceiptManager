import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import logger from '../logger';
import routes from '../Routes';

class Server {
    private static instance: Server;
    public app: express.Application;
    private PORT: number | string;
    private CLIENT_PORT: number = 3000;
    private uploadDir: string;

    private constructor() {
        this.app = express();
        this.PORT = process.env.PORT || 5000;
        this.CLIENT_PORT = 5173;
        this.uploadDir = path.join(__dirname, '../../ReceiptData/PDFInput');

        this.configureMiddleware();
        this.configureRoutes();
        this.ensureUploadDir();
    }

    public static getInstance(): Server {
        if (!Server.instance) {
            Server.instance = new Server();
        }
        return Server.instance;
    }

    private configureMiddleware(): void {
        this.app.use(express.json());

        const corsOptions = {
            origin: `http://localhost:${this.CLIENT_PORT}`,
            methods: 'GET,POST,PUT,DELETE',
            allowedHeaders: 'Content-Type,Authorization',
        };
        this.app.use(cors(corsOptions));
    }

    private ensureUploadDir(): void {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir);
        }
    }

    private configureRoutes(): void {
        this.app.use(routes);
    }

    public start(): void {
        this.app.listen(this.PORT, () => {
            logger.info(`Server running on http://localhost:${this.PORT}`);
        });
    }
}

export default Server;