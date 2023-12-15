import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './library/Logging';

const router = express();

//** Connect to Mongoose */
mongoose
    .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(() => {
        Logging.info('conected to MongoDB');
        StartServer();
    })
    .catch((error) => {
        Logging.error('Unable to connect');
        Logging.error(error);
    });

//* Only starts the server if MongoDB connects *//

const StartServer = () => {
    router.use((req, res, next) => {
        //*Log the request *//
        Logging.info(`incoming -> method: [${req.method} - url: [${req.url}] - IP: [${req.socket.remoteAddress}]`);
        res.on('finish', () => {
            //*Log the response *//
            Logging.info(`incoming -> method: [${req.method} - url: [${req.url}] - IP: [${req.socket.remoteAddress}] - status: [${res.statusCode}]`);
        });
        next();
    });

    router.use(express.urlencoded({ extended: true }));
    router.use(express.json());

    //** Rules of our API */
    router.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        if (req.method == 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
            return res.status(200).json({});
        }
        next();
    });

    //** Healthcheck */
    router.get('/ping', (req, res, next) => res.status(200).json({ hello: 'world' }));

    //** Error handling */
    router.use((req, res, next) => {
        const error = new Error('Not found');

        Logging.error(error);

        res.status(404).json({
            message: error.message
        });
    });

    http.createServer(router).listen(config.server.port, () => Logging.info(`Server is running on port ${config.server.port}`));
};
